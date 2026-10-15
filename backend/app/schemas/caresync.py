from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Medications ---
class MedicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, examples=["Metformin"])
    dosage: str = Field(..., min_length=1, max_length=100, examples=["500 mg"])
    frequency: str = Field(..., min_length=1, max_length=100, examples=["Twice daily after meals"])
    start_date: date = Field(..., examples=["2026-10-01"])
    end_date: Optional[date] = Field(None, examples=["2026-12-31"])
    reminders: Optional[str] = Field(None, max_length=200, examples=["08:00 AM, 08:00 PM"])
    instructions: Optional[str] = Field(None, max_length=500, examples=["Take with water after dinner"])


class MedicationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reminders: Optional[str] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None


class MedicationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date]
    reminders: Optional[str]
    instructions: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Prescriptions ---
class PrescriptionCreate(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255, examples=["prescription_dr_kapoor_oct2026.pdf"])
    doctor_name: Optional[str] = Field(None, max_length=150, examples=["Dr. Rajesh Kapoor"])
    prescription_date: date = Field(..., examples=["2026-10-12"])
    notes: Optional[str] = Field(None, max_length=1000, examples=["Prescription for seasonal allergic rhinitis"])
    file_url: Optional[str] = Field(None, max_length=500, examples=["https://storage.aarogya360.internal/docs/presc_102.pdf"])


class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    doctor_name: Optional[str]
    prescription_date: date
    notes: Optional[str]
    file_url: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Appointments ---
class AppointmentCreate(BaseModel):
    doctor_name: str = Field(..., min_length=1, max_length=150, examples=["Dr. Ananya Roy"])
    specialty: str = Field(..., min_length=1, max_length=100, examples=["Cardiologist"])
    appointment_datetime: datetime = Field(..., examples=["2026-10-25T10:30:00Z"])
    location: Optional[str] = Field(None, max_length=255, examples=["Apollo Hospital, Wing B, Room 402"])
    notes: Optional[str] = Field(None, max_length=1000, examples=["Routine annual heart checkup"])
    status: str = Field("scheduled", examples=["scheduled", "completed", "cancelled"])


class AppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    appointment_datetime: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = Field(None, examples=["scheduled", "completed", "cancelled"])


class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    doctor_name: str
    specialty: str
    appointment_datetime: datetime
    location: Optional[str]
    notes: Optional[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Caregivers ---
class CaregiverCreate(BaseModel):
    caregiver_email: EmailStr = Field(..., examples=["trusted.caregiver@example.com"])
    caregiver_name: Optional[str] = Field(None, max_length=150, examples=["Pooja Sharma"])
    relationship_type: Optional[str] = Field(None, max_length=100, examples=["Spouse", "Daughter", "Parent", "Friend"])
    consent_granted: bool = Field(True, description="Consent to share health summaries with caregiver")


class CaregiverConsentUpdate(BaseModel):
    consent_granted: bool = Field(..., description="Consent status toggle")


class CaregiverResponse(BaseModel):
    id: int
    user_id: int
    caregiver_email: str
    caregiver_name: Optional[str]
    relationship_type: Optional[str]
    consent_granted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
