import os
import google.generativeai as genai
from linkedin_api import Linkedin
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware 
import json

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LINKEDIN_USERNAME = os.getenv("LINKEDIN_USERNAME")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")

# Validate API Keys
if not GEMINI_API_KEY or not LINKEDIN_USERNAME or not LINKEDIN_PASSWORD:
    raise ValueError("⚠️ Missing API Keys! Set GEMINI_API_KEY, LINKEDIN_USERNAME, and LINKEDIN_PASSWORD in .env file.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Authenticate with LinkedIn
linkedin = Linkedin(LINKEDIN_USERNAME, LINKEDIN_PASSWORD)

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "https://solo-founder-ai.vercel.app/"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Request Model
class CompanyInput(BaseModel):
    description: str

# Gemini-based Ranking Function
def rank_investors_with_gemini(investors, description):
    try:
        prompt = f"""
        Given the following company description:
        "{description}"
        
        And the list of potential investors:
        {json.dumps(investors, indent=2)}

        Rank these investors based on how relevant they are for the company. Consider:
        - Whether their title includes "Investor", "Venture Capitalist", or "Angel Investor".
        - Their industry match with the company's description.
        - Availability of contact details (email is a plus).
        - Their location relevance to the company.

        Return a valid JSON array where each object has:
        - "name": Investor’s name
        - "title": Their title
        - "location": Their location
        - "profile_url": A link to their LinkedIn profile
        - "relevance_score": A score between 0-100 indicating how relevant they are (higher is better).
        
        if the linked url contains _ then reduce its relavanace score

        if name is LinkedIn Member then DONT INCLUDE IT IN THE RESPONSE

        if name is present then diplay it at the top of the list

        Output ONLY the JSON array, without any extra text.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            return investors  # Return unranked list if no response

        try:
            ranked_investors = json.loads(response.text.strip())

            # Ensure valid response format
            if isinstance(ranked_investors, list) and all(isinstance(i, dict) and "relevance_score" in i for i in ranked_investors):
                return sorted(ranked_investors, key=lambda x: x["relevance_score"], reverse=True)

        except json.JSONDecodeError:
            print("⚠️ Gemini returned invalid JSON. Using unranked investors.")
        
        return investors  # Return unranked list if parsing fails

    except Exception as e:
        print("Ranking error:", e)
        return investors  # Return unranked list if Gemini fails
    

@app.post("/find-investors")
def find_investors(data: CompanyInput):
    try:
        # Step 1: Use Gemini API to Generate Search Parameters
        prompt = f"""
        Given the following startup description: "{data.description}",
        generate the most relevant LinkedIn search filters to find those interested.
        - Keywords (list of two itesm) 
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        print(response)

        response = " ".join([s.strip() for s in response.text[0].split(",")])
        response+=" Investor"
        print(response)
        # Step 2: Use LinkedIn API to Search for Investors
        investors = linkedin.search_people(
            keywords=response,
            include_private_profiles=True,
            limit=20
        )
        
        print(investors)
        if not investors:
            return {"message": "No investors found."}

        # Step 3: Fetch Additional Data (Emails, Network Depth)
        enriched_investors = []
        for investor in investors:
            enriched_investors.append({
                "name": investor.get("name", ""),
                "location": investor.get("location", ""),
                "jobtitle": investor.get("jobtitle", ""),
                "profile_url": f"https://www.linkedin.com/in/{investor['urn_id']}"
            })
        print(enriched_investors)
        # Step 4: Rank Investors Using Gemini
        ranked_investors = rank_investors_with_gemini(enriched_investors, data.description)

        return {"investors": ranked_investors}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
class CompanyInput(BaseModel):
    description: str
    size: int  # Example: "11-50 employees"

def rank_competitors_with_gemini(competitors, description, size):
    """
    Uses Gemini AI to rank competitors based on similarity to the given company.
    """
    try:
        prompt = f"""
        Given the following company description:
        "{description}"

        And the list of potential competitor companies:
        {json.dumps(competitors, indent=2)}

        Rank these companies based on how much they smiliar they are to the first company
        Consider:
        - Similarity in industry and business model
        - Company size match
        - Overlapping target market and customers

        Return ONLY a valid JSON array without any extra explanation or formatting NO MARKDOWN, NEWLINES OR SPACES.
        Each object should have:
        - "name": Companies name
        - "industry": companies title
        - "size": companies size location
        - "profile_url": A link to their LinkedIn profile
        - "similarity_score": A score between 0-100 indicating how similar they are the first company (higher is better).

        arrange the objects in descending order of similarity_score.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        if not response or not response.text:
            return competitors  # Return unranked list if no response

        try:
            ranked_competitors = json.loads(response.text.strip())
            if isinstance(ranked_competitors, list):
                return ranked_competitors
        except json.JSONDecodeError:
            print("⚠ Gemini returned invalid JSON. Using unranked competitors.")

        return competitors  # Return unranked list if parsing fails

    except Exception as e:
        print("Ranking error:", e)
        return competitors  # Return unranked list if Gemini fails

class CompanyInput(BaseModel):
    description: str
    size: str  # Changed to str since LinkedIn company sizes are strings

def rank_competitors_with_gemini(competitors, description, size):
    """
    Uses Gemini AI to rank competitors based on similarity to the given company.
    """
    try:
        prompt = f"""
        Given the following company description and size:
        Description: "{description}"
        Size: "{size}"

        And the list of potential competitor companies:
        {json.dumps(competitors, indent=2)}

        Analyze and rank these companies based on their similarity to the described company.
        Consider:
        - Similarity in industry and business model
        - Company size compatibility
        - Overlapping target market and customers

        Return a JSON array where each object has these fields:
        - "name": Company name (string)
        - "industry": Company industry (string)
        - "size": Company size (string)
        - "profile_url": LinkedIn profile URL (string)
        - "similarity_score": Numerical score 0-100 (number)

        Format the response as a clean JSON array without any markdown or extra text.
        Sort by similarity_score in descending order.
        If any field is missing or null, use "Unknown" for text fields or 0 for numerical fields.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return competitors

        try:
            # Clean the response text to ensure it's valid JSON
            cleaned_response = response.text.strip()
            if not cleaned_response.startswith('['):
                # Find the first '[' and last ']' to extract just the JSON array
                start = cleaned_response.find('[')
                end = cleaned_response.rfind(']') + 1
                if start != -1 and end != 0:
                    cleaned_response = cleaned_response[start:end]
                else:
                    return competitors

            ranked_competitors = json.loads(cleaned_response)
            
            # Validate and clean the ranked competitors
            cleaned_competitors = []
            for comp in ranked_competitors:
                if isinstance(comp, dict) and comp.get('name'):  # Only include if it has a name
                    cleaned_comp = {
                        "name": str(comp.get('name', 'Unknown')),
                        "industry": str(comp.get('industry', 'Unknown')),
                        "size": str(comp.get('size', 'Unknown')),
                        "profile_url": str(comp.get('profile_url', '#')),
                        "similarity_score": float(comp.get('similarity_score', 0))
                    }
                    cleaned_competitors.append(cleaned_comp)
            
            return sorted(cleaned_competitors, key=lambda x: x['similarity_score'], reverse=True)

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error processing Gemini response: {e}")
            return competitors

    except Exception as e:
        print(f"Ranking error: {e}")
        return competitors

@app.post("/find-competitors")
async def find_competitors(data: CompanyInput):
    """
    Finds and ranks competitor companies using LinkedIn API and Gemini AI.
    """
    try:
        # Step 1: Generate search parameters using Gemini
        prompt = f"""
        Given this company description: "{data.description}",
        return a single relevant keyword for finding similar companies on LinkedIn.
        Return only the keyword without quotes or brackets.
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate search keyword")

        keyword = response.text.strip().replace('"', '').replace('[', '').replace(']', '')

        # Step 2: Search for companies
        competitors = linkedin.search_companies(
            keywords=keyword,
            limit=20
        )

        if not competitors:
            return {"competitors": [], "message": "No competitors found"}

        # Step 3: Format company data
        competitor_list = []
        for company in competitors:
            if company.get('name'):  # Only include if name exists
                competitor_list.append({
                    "name": str(company.get('name', 'Unknown')),
                    "industry": str(company.get('headline', 'Unknown')),
                    "size": str(company.get('subline', 'Unknown')),
                    "profile_url": f"https://www.linkedin.com/company/{company.get('urn_id', '')}"
                })

        # Step 4: Rank competitors
        ranked_competitors = rank_competitors_with_gemini(competitor_list, data.description, data.size)

        return {"competitors": ranked_competitors}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")