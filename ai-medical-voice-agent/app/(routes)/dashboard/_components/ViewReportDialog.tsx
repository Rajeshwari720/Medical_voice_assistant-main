import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { SessionDetail } from '../medical-agent/[sessionId]/page';
import moment from 'moment';

type Props = {
  record?: SessionDetail;
};

function ViewReportDialog({ record }: Props) {
  // Parse the report JSON safely
  const reportData =
    typeof record?.report === 'string'
      ? JSON.parse(record.report)
      : record?.report || {};

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="link" size="sm">View Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className="text-center text-3xl font-bold">
              Medical AI Voice Agent Report
            </h2>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-10 space-y-8">

              {/* Video Info */}
              <section>
                <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                  Video Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mt-3">
                  <div>
                    <span className="font-semibold">Doctor Specialization:</span>{" "}
                    {record?.selectedDoctor?.specialist || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Consult Date:</span>{" "}
                    {record?.createdOn
                      ? moment(new Date(record.createdOn)).format("MMMM D, YYYY h:mm A")
                      : "Unknown"}
                  </div>
                </div>
              </section>

              {/* Chief Complaint */}
              {reportData?.chiefComplaint && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Chief Complaint
                  </h2>
                  <p className="mt-2 text-gray-700">{reportData.chiefComplaint}</p>
                </section>
              )}

              {/* Summary */}
              {reportData?.summary && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Summary
                  </h2>
                  <p className="mt-2 text-gray-700">{reportData.summary}</p>
                </section>
              )}

              {/* Symptoms */}
              {Array.isArray(reportData?.symptoms) && reportData.symptoms.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Symptoms
                  </h2>
                  <ul className="list-disc pl-6 mt-2 text-gray-700">
                    {reportData.symptoms.map((symptom: string, idx: number) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Duration & Severity */}
              {(reportData?.duration || reportData?.severity) && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Condition Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-gray-700">
                    {reportData?.duration && (
                      <div>
                        <span className="font-semibold">Duration:</span> {reportData.duration}
                      </div>
                    )}
                    {reportData?.severity && (
                      <div>
                        <span className="font-semibold">Severity:</span> {reportData.severity}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Medications */}
              {Array.isArray(reportData?.medicationsMentioned) && reportData.medicationsMentioned.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Medications
                  </h2>
                  <ul className="list-disc pl-6 mt-2 text-gray-700">
                    {reportData.medicationsMentioned.map((med: string, idx: number) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Recommendations */}
              {Array.isArray(reportData?.recommendations) && reportData.recommendations.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-blue-500 border-b pb-1">
                    Recommendations
                  </h2>
                  <ul className="list-disc pl-6 mt-2 text-gray-700">
                    {reportData.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
