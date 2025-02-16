from setuptools import setup, find_packages

setup(
    name="your-app-name",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "google-generativeai",
        # add other dependencies from your requirements.txt
    ],
)