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
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
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
