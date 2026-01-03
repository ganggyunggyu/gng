"""
LiveKit Voice Agent for Grok and Gemini
Run with: python voice_agent.py dev
"""

import os
import json
import logging
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import openai, google

load_dotenv()

logger = logging.getLogger("voice-agent")
logger.setLevel(logging.INFO)


async def entrypoint(ctx: agents.JobContext):
    """Main entrypoint for the voice agent."""

    logger.info(f"Connecting to room: {ctx.room.name}")

    # Get voice provider from participant metadata
    voice_provider = "grok"  # default

    await ctx.connect()

    # Check participant metadata for provider preference
    for participant in ctx.room.remote_participants.values():
        if participant.metadata:
            try:
                metadata = json.loads(participant.metadata)
                voice_provider = metadata.get("voiceProvider", "grok")
                system_prompt = metadata.get("systemPrompt", "")
                break
            except json.JSONDecodeError:
                pass

    logger.info(f"Using voice provider: {voice_provider}")

    # Create the appropriate realtime model
    if voice_provider == "gemini":
        model = google.realtime.RealtimeSession(
            model="gemini-2.5-flash-native-audio-preview",
            voice="Puck",  # Available: Puck, Charon, Kore, Fenrir, Aoede
            system_instructions=system_prompt if system_prompt else None,
        )
    else:
        # Grok uses OpenAI-compatible API
        model = openai.realtime.RealtimeSession(
            base_url="https://api.x.ai/v1/realtime",
            api_key=os.getenv("XAI_API_KEY"),
            model="grok-2-public",
            voice="sage",  # Available voices for Grok
            instructions=system_prompt if system_prompt else "You are a helpful AI assistant.",
        )

    # Create and start the agent
    agent = Agent(instructions=system_prompt or "You are a helpful AI assistant.")
    session = AgentSession(
        stt=model,
        llm=model,
        tts=model,
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            text_enabled=True,
            audio_enabled=True,
        ),
    )

    # Send transcript updates to the room
    @session.on("user_speech_committed")
    async def on_user_speech(text: str):
        await ctx.room.local_participant.publish_data(
            json.dumps({
                "type": "transcript",
                "role": "user",
                "text": text,
                "isFinal": True,
            }).encode()
        )

    @session.on("agent_speech_committed")
    async def on_agent_speech(text: str):
        await ctx.room.local_participant.publish_data(
            json.dumps({
                "type": "transcript",
                "role": "assistant",
                "text": text,
                "isFinal": True,
            }).encode()
        )

    logger.info("Agent session started successfully")


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
