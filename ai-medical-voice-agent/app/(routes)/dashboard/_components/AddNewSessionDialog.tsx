"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import DoctorAgentCard from "./DoctorAgentCard";
import type { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import {useRouter} from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { SessionDetail } from '../medical-agent/[sessionId]/page';


function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent | null>(null);
const router = useRouter(); 
const { has } = useAuth();
// ✅ Add this line
const [historyList, sethistoryList]=useState<SessionDetail[]>([])

   //@ts-ignore
    const paidUser=has && has({plan: 'pro'});
    
    useEffect(() => {
          GetHistoryList();
        }, []);
  
        const GetHistoryList=async()=>{
          const result= await axios.get('/api/session-chat?sessionId=all');
          console.log(result.data);
          
        
      }





  /*const OnClickNext = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });
      console.log(result.data);
      setSuggestedDoctors(result.data.doctors || []);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };*/

const OnClickNext = async () => {
  try {
    setLoading(true);
    const result = await axios.post("/api/suggest-doctors", { notes: note });
    console.log("API response:", result.data);

    // result.data is already JSON (array or object)
    let doctors: doctorAgent[] = [];

    if (Array.isArray(result.data)) {
      doctors = result.data;
    } else if (result.data?.doctors) {
      doctors = result.data.doctors;
    }

    // Assign IDs if missing
    doctors = doctors.map((d, index) => ({
  ...d,
  id: d.id || index + 1
}));

    setSuggestedDoctors(doctors);
  } catch (error) {
    console.error("API error:", error);
  } finally {
    setLoading(false);
  }
};

  const onStartConsultation= async()=>{
    //Save all info to database
    setLoading(true);
    try {
      const result= await axios.post('/api/session-chat', {
  notes: note,
  selectedDoctor: selectedDoctor // ✅ Lowercase key, matches backend
});


      console.log(result.data)
      if(result.data?.sessionId){
        console.log(result.data.sessionId);

      router.push('/dashboard/medical-agent/'+result.data.sessionId);
      
      }
    } catch (error) {
      console.error("Session error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="mt-3" disabled={!paidUser && historyList?.length >=1}>+ Start a Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription asChild>
            {suggestedDoctors.length === 0 ? (
              <div>
                <h2>Add the Symptoms or Any related details</h2>
                <Textarea
                  placeholder="Add Details here..."
                  className="h-[200px] mt-1"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            ) : (

              <div > 
                <h2> select doctor</h2>
              <div className="grid grid-cols-3 gap-5">
                {suggestedDoctors.map((doctor, index) => (
                  <SuggestedDoctorCard
  doctorAgent={doctor}
  key={index}
  setSelectedDoctor={setSelectedDoctor}
  //@ts-ignore
  selectedDoctor={selectedDoctor}
/>

                ))}
              </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>

          {suggestedDoctors.length === 0 ? (
            <Button disabled={!note || loading} onClick={OnClickNext}>
              Next {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          ) : (
            <Button  disabled={ loading|| !selectedDoctor} onClick={()=>onStartConsultation()}>
              Start Consultation
              {loading ? <Loader2 className="animate-spin ml-2" /> : <ArrowRight className="ml-2" />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
