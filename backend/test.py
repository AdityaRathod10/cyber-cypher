from linkedin_api import Linkedin
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LINKEDIN_USERNAME = os.getenv("LINKEDIN_USERNAME")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")
linkedin = Linkedin(LINKEDIN_USERNAME, LINKEDIN_PASSWORD)


investors = linkedin.search_people(
            keywords="AI investor",
            include_private_profiles=True,
            limit=20
        )
print(investors)
