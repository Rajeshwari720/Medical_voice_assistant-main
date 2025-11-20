"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type messages = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, SetMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails();
    }
  }, [sessionId]);

  // Cleanup on unmount: stop and remove listeners if any
  useEffect(() => {
    return () => {
      if (vapiInstance) {
        try {
          vapiInstance.stop();
          if (typeof vapiInstance.removeAllListeners === "function") {
            vapiInstance.removeAllListeners();
          }
        } catch (err) {
          console.error("Error during Vapi cleanup:", err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on unmount

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=" + sessionId);
      console.log(result.data);
      setSessionDetail(result.data);
    } catch (err) {
      console.error("Failed to fetch session details:", err);
    }
  };

  const StartCall = async () => {
    if (
      !process.env.NEXT_PUBLIC_VAPI_API_KEY ||
      !process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID
    ) {
      console.error("Missing VAPI configuration");
      return;
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);

    // Attach an error handler BEFORE calling start, so unhandled errors don't crash app
    vapi.on("error", (err: any) => {
      console.error("Vapi error event:", err);
      // Optionally surface to UI or set state
    });

    // Attach other handlers
    vapi.on("call-start", () => {
      console.log("Call started");
      setCallStarted(true);
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setCallStarted(false);
    });

    vapi.on("message", (message: any) => {
      try {
        if (message?.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          console.log(`${role}: ${transcript}`);
          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            SetMessages((prev) => [...prev, { role: role, text: transcript }]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      } catch (e) {
        console.error("Error handling Vapi message:", e);
      }
    });

    vapi.on("speech-start", () => {
      console.log("Assistant started speaking");
      setCurrentRole("assistant");
    });

    vapi.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setCurrentRole("user");
    });

    // Save instance before starting (so other code can access it)
    setVapiInstance(vapi);

    // Start call with try/catch to handle immediate errors
    try {
      // some SDKs return a promise; await if start() returns one
      const maybePromise = vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } catch (err) {
      console.error("Vapi start() failed:", err);
      // If start fails, remove listeners and clear instance
      try {
        if (typeof vapi.removeAllListeners === "function") vapi.removeAllListeners();
      } catch (e) {
        console.error("Failed to cleanup vapi after failed start:", e);
      }
      setVapiInstance(null);
    }
  };

  const endCall = async () => {
    setLoading(true);
    if (!vapiInstance) {
      setLoading(false);
      return;
    }

    try {
      // Stop the call (may emit events)
      const maybePromise = vapiInstance.stop();
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } catch (err) {
      console.error("Error while stopping Vapi:", err);
      // continue to cleanup
    }

    // Safely remove all listeners (avoid off(undefined) issue)
    try {
      if (typeof vapiInstance.removeAllListeners === "function") {
        vapiInstance.removeAllListeners();
      }
    } catch (err) {
      console.error("Error removing Vapi listeners:", err);
    }

    setCallStarted(false);
    setVapiInstance(null);

    try {
      await GenerateReport();
    } catch (err) {
      console.error("GenerateReport failed:", err);
    }

    setLoading(false);
    // optionally redirect after report

    toast.success('Your Report is Generated')
    router.replace('/dashboard');
  };

  const GenerateReport = async () => {
    try {
      const result = await axios.post("/api/medical-report", {
        messages: messages,
        sessionDetail: sessionDetail,
        sessionId: sessionId,
      });
      console.log(result.data);
      return result.data;
    } catch (err) {
      console.error("Failed to generate report:", err);
      throw err;
    }
  };

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle
            className={`h-4 w-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected..." : "Not Connected "}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>

      {sessionDetail && (
        <div className="flex items-center flex-col mt-10">
          <Image
            src={sessionDetail?.selectedDoctor?.image}
            alt={sessionDetail?.selectedDoctor?.specialist ?? ""}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg">
            {sessionDetail?.selectedDoctor?.specialist}
          </h2>
          <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72 ">
            {messages?.slice(-4).map((msg, index) => (
              <h2 className="text-gray-400 p-2" key={index}>
                {msg.role}: {msg.text}
              </h2>
            ))}
            {liveTranscript && liveTranscript.length > 0 && (
              <h2 className="text-lg">
                {currentRole}: {liveTranscript}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : <PhoneCall />}
              Start Call
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              onClick={endCall}
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : <PhoneOff />}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
