from openai import OpenAI
from groq import Groq
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import anthropic


openai_client = OpenAI(api_key='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')
openai_convo = []

Groq_client = Groq(api_key='xai-uJjm7vCMZ9UJqFxI53wXM7MpCJIU1sYh8QcRrgl4A9anhIzTCqCD2JLf0xd3hJGdNEMdx1jeXz324wlf')
groq_convo = []

claude_client = anthropic.Anthropic(api_key='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')
claude_convo = []

gemini_safety_setting = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE                                          
    }
genai.configure(api_key='')