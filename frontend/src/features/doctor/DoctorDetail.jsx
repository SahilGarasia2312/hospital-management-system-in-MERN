// features/doctor/DoctorDetail.jsx (Stub for completeness based on old routes)
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useParams } from "react-router-dom";

const DoctorDetail = () => {
  const { doctorId } = useParams();
  
  return (
    <AppLayout title="Doctor Details">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Details for Doctor #{doctorId}</h3>
        </div>
        <p>This page can be expanded to show full doctor profile and history.</p>
      </div>
    </AppLayout>
  );
};

export default DoctorDetail;
