import os
import google.generativeai as genai
from linkedin_api import Linkedin
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware 
import json
from typing import Optional, List

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LINKEDIN_USERNAME = os.getenv("LINKEDIN_USERNAME")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

# Validate API Keys
if not GEMINI_API_KEY or not LINKEDIN_USERNAME or not LINKEDIN_PASSWORD:
    raise ValueError("⚠️ Missing API Keys! Set GEMINI_API_KEY, LINKEDIN_USERNAME, and LINKEDIN_PASSWORD in .env file.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Mock data for testing
MOCK_INVESTORS = [
    {
        "name": "John Doe",
        "location": "San Francisco Bay Area",
        "jobtitle": "Venture Capitalist",
        "profile_url": "https://www.linkedin.com/in/johndoe"
    },
    {
        "name": "Jane Smith",
        "location": "New York City",
        "jobtitle": "Angel Investor",
        "profile_url": "https://www.linkedin.com/in/janesmith"
    }
]

# LinkedIn client initialization with retry mechanism
def initialize_linkedin() -> Optional[Linkedin]:
    if MOCK_MODE:
        print("Running in mock mode")
        return None
        
    try:
        client = Linkedin(LINKEDIN_USERNAME, LINKEDIN_PASSWORD)
        return client
    except Exception as e:
        print(f"LinkedIn authentication error: {str(e)}")
        return None

# Initialize LinkedIn client
linkedin = initialize_linkedin()

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://solo-founder-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class CompanyInput(BaseModel):
    description: str
    size: Optional[int] = None

# Gemini-based Ranking Function
def rank_investors_with_gemini(investors: List[dict], description: str) -> List[dict]:
    try:
        prompt = f"""
        Given the following company description:
        "{description}"
        
        And the list of potential investors:
        {json.dumps(investors, indent=2)}

        Rank these investors based on how relevant they are for the company. Consider:
        - Whether their title includes "Investor", "Venture Capitalist", or "Angel Investor"
        - Their industry match with the company's description
        - Availability of contact details (email is a plus)
        - Their location relevance to the company

        Return a valid JSON array where each object has:
        - "name": Investor's name
        - "title": Their title
        - "location": Their location
        - "profile_url": A link to their LinkedIn profile
        - "relevance_score": A score between 0-100 indicating how relevant they are (higher is better)
        
        if the linked url contains _ then reduce its relevance score
        if name is LinkedIn Member then DONT INCLUDE IT IN THE RESPONSE
        if name is present then display it at the top of the list

        Output ONLY the JSON array, without any extra text.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            return investors

        try:
            ranked_investors = json.loads(response.text.strip())
            if isinstance(ranked_investors, list) and all(isinstance(i, dict) and "relevance_score" in i for i in ranked_investors):
                return sorted(ranked_investors, key=lambda x: x["relevance_score"], reverse=True)
        except json.JSONDecodeError:
            print("⚠️ Gemini returned invalid JSON. Using unranked investors.")
        
        return investors

    except Exception as e:
        print("Ranking error:", e)
        return investors

def rank_competitors_with_gemini(competitors: List[dict], description: str, size: Optional[int]) -> List[dict]:
    try:
        prompt = f"""
        Given the following company description:
        "{description}"

        And the list of potential competitor companies:
        {json.dumps(competitors, indent=2)}

        Rank these companies based on how similar they are to the first company
        Consider:
        - Similarity in industry and business model
        - Company size match
        - Overlapping target market and customers

        Return ONLY a valid JSON array without any extra explanation or formatting NO MARKDOWN, NEWLINES OR SPACES.
        Each object should have:
        - "name": Company's name
        - "industry": Company's industry
        - "size": Company's size
        - "profile_url": A link to their LinkedIn profile
        - "similarity_score": A score between 0-100 indicating similarity (higher is better)

        Arrange the objects in descending order of similarity_score.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return competitors

        try:
            ranked_competitors = json.loads(response.text.strip())
            if isinstance(ranked_competitors, list):
                return ranked_competitors
        except json.JSONDecodeError:
            print("⚠️ Gemini returned invalid JSON. Using unranked competitors.")

        return competitors

    except Exception as e:
        print("Ranking error:", e)
        return competitors

@app.post("/find-investors")
async def find_investors(data: CompanyInput):
    try:
        if MOCK_MODE:
            return {"investors": rank_investors_with_gemini(MOCK_INVESTORS, data.description)}

        if not linkedin:
            raise HTTPException(
                status_code=503,
                detail="LinkedIn service temporarily unavailable. Please try again later."
            )

        # Step 1: Use Gemini API to Generate Search Parameters
        prompt = f"""
        Given the following startup description: "{data.description}",
        generate the most relevant LinkedIn search filters to find those interested.
        - Keywords (list of two items) 
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate search parameters")

        search_keywords = " ".join([s.strip() for s in response.text[0].split(",")]) + " Investor"

        # Step 2: Use LinkedIn API to Search for Investors
        try:
            investors = linkedin.search_people(
                keywords=search_keywords,
                include_private_profiles=True,
                limit=20
            )
        except Exception as e:
            print(f"LinkedIn search error: {str(e)}")
            raise HTTPException(status_code=503, detail="LinkedIn search temporarily unavailable")

        if not investors:
            return {"message": "No investors found.", "investors": []}

        # Step 3: Fetch Additional Data
        enriched_investors = []
        for investor in investors:
            if investor.get("name", "").lower() != "linkedin member":
                enriched_investors.append({
                    "name": investor.get("name", ""),
                    "location": investor.get("location", ""),
                    "jobtitle": investor.get("jobtitle", ""),
                    "profile_url": f"https://www.linkedin.com/in/{investor['urn_id']}"
                })

        # Step 4: Rank Investors Using Gemini
        ranked_investors = rank_investors_with_gemini(enriched_investors, data.description)

        return {"investors": ranked_investors}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/find-competitors")
async def find_competitors(data: CompanyInput):
    try:
        if not linkedin:
            raise HTTPException(
                status_code=503,
                detail="LinkedIn service temporarily unavailable. Please try again later."
            )

        # Step 1: Generate search parameters using Gemini
        prompt = f"""
        Given the following startup description: "{data.description}",
        generate one keyword that can be used to filter on linkedin for similar companies in this format:
        ["Keyword"]
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate search parameters")

        keyword = response.text.strip()

        # Step 2: Use LinkedIn API to Search for Similar Companies
        try:
            competitors = linkedin.search_companies(
                keywords=keyword,
                limit=20
            )
        except Exception as e:
            print(f"LinkedIn search error: {str(e)}")
            raise HTTPException(status_code=503, detail="LinkedIn search temporarily unavailable")

        if not competitors:
            return {"message": "No competitors found.", "competitors": []}

        # Step 3: Format Data
        competitor_list = []
        for company in competitors:
            competitor_list.append({
                "name": company.get("name", "Unknown"),
                "industry": company.get("headline", "Unknown"),
                "size": company.get("subline", "Unknown"),
                "profile_url": f"https://www.linkedin.com/company/{company.get('urn_id')}"
            })

        # Step 4: Rank Competitors using Gemini
        ranked_competitors = rank_competitors_with_gemini(
            competitor_list,
            data.description,
            data.size
        )

        return {"competitors": ranked_competitors}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mock_mode": MOCK_MODE,
        "linkedin_client": "connected" if linkedin else "disconnected"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Investor Search API",
        "endpoints": {
            "find_investors": "/find-investors",
            "find_competitors": "/find-competitors",
            "health": "/health"
        },
        "status": "online"
    }