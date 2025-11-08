from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool
from typing import List, Dict, Any, Optional
from PIL import Image
from ..core.config import settings


# Define the show_images tool using LangChain decorator
@tool
def show_images(image_ids: list[int]) -> str:
    """Display image previews to the user. Use this when the user asks to see images, show images, or wants to view specific images from their archive.

    Args:
        image_ids: Array of image IDs to display
    """
    return f"Displaying {len(image_ids)} images"


class GeminiService:
    """Service for Gemini AI interactions"""

    def __init__(self):
        """Initialize Gemini API with LangChain"""

        # Initialize LangChain Gemini model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            temperature=0.7,
            google_api_key=settings.GEMINI_API_KEY,
        )

        # Bind tools to the model
        self.chat_model = self.llm.bind_tools([show_images])

        # Store tool reference for later use
        self.tools = [show_images]

        self.image_gen_available = False
        print("✅ Gemini service initialized successfully with LangChain")

    async def chat(
        self,
        message: str,
        image_context: Optional[List[Dict[str, Any]]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Send a chat message to Gemini with optional image context using LangChain

        Args:
            message: User's message
            image_context: List of image metadata for context
            conversation_history: Previous conversation messages

        Returns:
            Dictionary with response text and optional image_ids to display
        """
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

        # Build messages list
        messages = []

        # Add system context if image_context is provided
        if image_context:
            context_str = """You are an AI assistant helping a user manage their image archive. Your role is to:
1. Help users find and organize images
2. Suggest images for specific tasks (newsletters, presentations, social media, etc.)
3. Provide creative guidance and descriptions
4. Always explain WHY you're showing specific images and HOW they can be used

Here are the images from their collection:

"""
            for img_data in image_context:
                context_str += f"- Image ID {img_data.get('id')}: {img_data.get('filename', 'Unknown')}\n"
                context_str += f"  Uploaded: {img_data.get('upload_date', 'Unknown')}\n"
                context_str += f"  Tags: {', '.join(img_data.get('tags', []))}\n"
                context_str += f"  Description: {img_data.get('description', 'No description')}\n\n"

            context_str += """\nCRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:
1. When you use the show_images function, you MUST also provide text in your response
2. NEVER just call show_images alone - always include helpful text explaining:
   * Why you selected these specific images
   * How they can be used for the user's purpose
   * Creative suggestions and descriptions
   * Draft captions for newsletters/social media if relevant
3. Your response should have BOTH text content AND the show_images function call
4. Be conversational, helpful, and provide actionable guidance
5. For business use cases (newsletters, presentations), provide professional copy and suggestions

Example format:
"I found 2 perfect cat images for your grooming newsletter! [call show_images function]

The first image shows a fluffy cat that would work great as your header image. You could use the caption: 'Transform your feline's look with our expert grooming services!'

The second image captures that 'before and after' potential that customers love to see."
"""
            messages.append(SystemMessage(content=context_str))

        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    messages.append(HumanMessage(content=content))
                else:
                    messages.append(AIMessage(content=content))

        # Add current message
        messages.append(HumanMessage(content=message))

        try:
            # Invoke the model with tools
            response = self.chat_model.invoke(messages)

            # Debug logging
            print(f"Response type: {type(response)}")
            print(f"Has tool_calls: {hasattr(response, 'tool_calls')}")
            if hasattr(response, 'tool_calls'):
                print(f"Tool calls: {response.tool_calls}")
            print(f"Response content: {response.content if hasattr(response, 'content') else 'No content'}")

            # Check if model wants to call a tool
            image_ids = None
            if hasattr(response, 'tool_calls') and response.tool_calls and len(response.tool_calls) > 0:
                # Extract tool call information
                for tool_call in response.tool_calls:
                    print(f"Processing tool call: {tool_call}")
                    if tool_call.get('name') == 'show_images':
                        image_ids = tool_call.get('args', {}).get('image_ids', [])
                        print(f"Extracted image_ids: {image_ids}")
                        break

                # If there's a tool call, we need to execute it and get a follow-up response
                if image_ids:
                    from langchain_core.messages import ToolMessage

                    # Execute the tool (simulate execution)
                    tool_result = f"Successfully displayed {len(image_ids)} images to the user."

                    # Add the AI response with tool call to messages
                    messages.append(response)

                    # Add the tool result
                    messages.append(ToolMessage(
                        content=tool_result,
                        tool_call_id=response.tool_calls[0].get('id', 'call_1')
                    ))

                    # Get a follow-up response from the model
                    follow_up_response = self.llm.invoke(messages)  # Use llm without tools
                    response_text = follow_up_response.content if hasattr(follow_up_response, 'content') else ""

                    return {
                        "text": response_text,
                        "image_ids": image_ids
                    }

            # Get text response (no tool call)
            response_text = response.content if hasattr(response, 'content') and response.content else ""

            # Strip out any literal tool call syntax from the text
            import re
            response_text = re.sub(r'\[show_images\([^\]]+\)\]', '', response_text).strip()

            return {
                "text": response_text,
                "image_ids": image_ids
            }

        except Exception as e:
            print(f"Error generating chat response: {e}")
            import traceback
            traceback.print_exc()
            return {
                "text": f"I apologize, but I encountered an error: {str(e)}",
                "image_ids": None
            }

    async def analyze_image(self, image_path: str, query: str) -> str:
        """
        Analyze an image and answer questions about it

        Args:
            image_path: Path to the image file
            query: Question about the image

        Returns:
            Gemini's analysis
        """
        from langchain_core.messages import HumanMessage
        import base64

        try:
            # Read and encode image
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")

            # Create message with image
            message = HumanMessage(
                content=[
                    {"type": "text", "text": query},
                    {
                        "type": "image_url",
                        "image_url": f"data:image/jpeg;base64,{image_data}",
                    },
                ]
            )

            response = self.llm.invoke([message])
            return response.content
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return f"Error analyzing image: {str(e)}"

    async def generate_image(self, prompt: str) -> Optional[bytes]:
        """
        Generate an image from a text prompt using Gemini
        Note: Not available with current setup
        """
        return None

    async def edit_image(self, image_path: str, edit_prompt: str) -> Optional[bytes]:
        """
        Edit an image using AI based on a text prompt
        Note: Not available with current setup
        """
        return None

    async def suggest_images_for_task(
        self,
        task_description: str,
        available_images: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Suggest which images from the user's archive would be best for a task

        Args:
            task_description: What the user wants to do
            available_images: List of image metadata

        Returns:
            Dictionary with suggested image IDs and reasoning
        """
        from langchain_core.messages import HumanMessage

        # Build prompt
        prompt = f"""Task: {task_description}

Available images in the user's archive:
"""
        for idx, img in enumerate(available_images, 1):
            prompt += f"\n{idx}. ID: {img.get('id')} - {img.get('filename')}"
            prompt += f"\n   Tags: {', '.join(img.get('tags', []))}"
            prompt += f"\n   Description: {img.get('description', 'No description')}"

        prompt += """\n\nBased on the task description, which images would be most suitable?
Provide your response in this format:
Suggested Images: [list of image IDs]
Reasoning: [why these images are suitable]
Additional Guidance: [any tips for using these images for the task]"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {
                "response": response.content,
                "task": task_description
            }
        except Exception as e:
            print(f"Error suggesting images: {e}")
            return {
                "response": f"Error: {str(e)}",
                "task": task_description
            }


# Create a singleton instance
_gemini_service = None


def get_gemini_service() -> GeminiService:
    """Get or create the Gemini service singleton"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
