from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.caresync import Appointment, Caregiver, Medication, Prescription
from app.models.user import User
from app.schemas.caresync import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
    CaregiverConsentUpdate,
    CaregiverCreate,
    CaregiverResponse,
    MedicationCreate,
    MedicationResponse,
    MedicationUpdate,
    PrescriptionCreate,
    PrescriptionResponse,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/caresync", tags=["CareSync"])


# ==========================================
# 1. MEDICATIONS
# ==========================================
@router.post(
    "/medications",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new medication",
)
async def create_medication(
    payload: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MedicationResponse:
    """Add a new medication schedule with reminders and dosage instructions."""
    med = Medication(
        user_id=current_user.id,
        name=payload.name.strip(),
        dosage=payload.dosage.strip(),
        frequency=payload.frequency.strip(),
        start_date=payload.start_date,
        end_date=payload.end_date,
        reminders=payload.reminders,
        instructions=payload.instructions,
        is_active=True,
    )
    db.add(med)
    await db.commit()
    await db.refresh(med)
    return MedicationResponse.model_validate(med)


@router.get(
    "/medications",
    response_model=List[MedicationResponse],
    summary="List medications for current user",
)
async def list_medications(
    active_only: bool = Query(True, description="Filter for currently active medications only"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[MedicationResponse]:
    """Retrieve user medications, sorted by creation date."""
    query = select(Medication).where(Medication.user_id == current_user.id)
    if active_only:
        query = query.where(Medication.is_active.is_(True))
    query = query.order_by(desc(Medication.created_at))

    result = await db.execute(query)
    meds = result.scalars().all()
    return [MedicationResponse.model_validate(m) for m in meds]


@router.get(
    "/medications/{med_id}",
    response_model=MedicationResponse,
    summary="Get single medication details",
)
async def get_medication(
    med_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MedicationResponse:
    """Retrieve single medication by ID."""
    query = select(Medication).where(Medication.id == med_id, Medication.user_id == current_user.id)
    result = await db.execute(query)
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")
    return MedicationResponse.model_validate(med)


@router.put(
    "/medications/{med_id}",
    response_model=MedicationResponse,
    summary="Update medication information",
)
async def update_medication(
    med_id: int,
    payload: MedicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MedicationResponse:
    """Update medication schedule, reminders, active status or dosage."""
    query = select(Medication).where(Medication.id == med_id, Medication.user_id == current_user.id)
    result = await db.execute(query)
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(med, k, v)

    await db.commit()
    await db.refresh(med)
    return MedicationResponse.model_validate(med)


@router.delete(
    "/medications/{med_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete medication",
)
async def delete_medication(
    med_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a medication record."""
    query = select(Medication).where(Medication.id == med_id, Medication.user_id == current_user.id)
    result = await db.execute(query)
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")
    await db.delete(med)
    await db.commit()


# ==========================================
# 2. PRESCRIPTIONS
# ==========================================
@router.post(
    "/prescriptions",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save prescription metadata",
)
async def create_prescription(
    payload: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionResponse:
    """Record prescription metadata: filename, doctor name, prescription date, and clinical notes."""
    prescription = Prescription(
        user_id=current_user.id,
        filename=payload.filename.strip(),
        doctor_name=payload.doctor_name.strip() if payload.doctor_name else None,
        prescription_date=payload.prescription_date,
        notes=payload.notes,
        file_url=payload.file_url,
    )
    db.add(prescription)
    await db.commit()
    await db.refresh(prescription)
    return PrescriptionResponse.model_validate(prescription)


@router.get(
    "/prescriptions",
    response_model=List[PrescriptionResponse],
    summary="List user prescriptions",
)
async def list_prescriptions(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[PrescriptionResponse]:
    """Retrieve chronological list of uploaded prescription records."""
    query = (
        select(Prescription)
        .where(Prescription.user_id == current_user.id)
        .order_by(desc(Prescription.prescription_date))
        .limit(limit)
    )
    result = await db.execute(query)
    records = result.scalars().all()
    return [PrescriptionResponse.model_validate(p) for p in records]


@router.delete(
    "/prescriptions/{prescription_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a prescription record",
)
async def delete_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a prescription record."""
    query = select(Prescription).where(
        Prescription.id == prescription_id, Prescription.user_id == current_user.id
    )
    result = await db.execute(query)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    await db.delete(record)
    await db.commit()


# ==========================================
# 3. APPOINTMENTS
# ==========================================
@router.post(
    "/appointments",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule an appointment",
)
async def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AppointmentResponse:
    """Schedule a medical consultation with a doctor/specialist."""
    appointment = Appointment(
        user_id=current_user.id,
        doctor_name=payload.doctor_name.strip(),
        specialty=payload.specialty.strip(),
        appointment_datetime=payload.appointment_datetime,
        location=payload.location,
        notes=payload.notes,
        status=payload.status or "scheduled",
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.get(
    "/appointments",
    response_model=List[AppointmentResponse],
    summary="List user appointments",
)
async def list_appointments(
    status_filter: Optional[str] = Query(None, description="Filter by status (scheduled/completed/cancelled)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[AppointmentResponse]:
    """Retrieve appointments, optionally filtered by status."""
    query = select(Appointment).where(Appointment.user_id == current_user.id)
    if status_filter:
        query = query.where(Appointment.status == status_filter.lower())
    query = query.order_by(Appointment.appointment_datetime.asc())

    result = await db.execute(query)
    appointments = result.scalars().all()
    return [AppointmentResponse.model_validate(a) for a in appointments]


@router.put(
    "/appointments/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Update appointment details or status",
)
async def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AppointmentResponse:
    """Update doctor, specialty, time, location, or status (e.g. marked completed)."""
    query = select(Appointment).where(
        Appointment.id == appointment_id, Appointment.user_id == current_user.id
    )
    result = await db.execute(query)
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(appointment, k, v)

    await db.commit()
    await db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.delete(
    "/appointments/{appointment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete/cancel an appointment",
)
async def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove an appointment record."""
    query = select(Appointment).where(
        Appointment.id == appointment_id, Appointment.user_id == current_user.id
    )
    result = await db.execute(query)
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    await db.delete(appointment)
    await db.commit()


# ==========================================
# 4. CAREGIVERS
# ==========================================
@router.post(
    "/caregivers",
    response_model=CaregiverResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a trusted caregiver by email",
)
async def add_caregiver(
    payload: CaregiverCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CaregiverResponse:
    """Add a trusted family member or caregiver to monitor care with consent permissions."""
    caregiver = Caregiver(
        user_id=current_user.id,
        caregiver_email=payload.caregiver_email.lower().strip(),
        caregiver_name=payload.caregiver_name.strip() if payload.caregiver_name else None,
        relationship_type=payload.relationship_type.strip() if payload.relationship_type else None,
        consent_granted=payload.consent_granted,
    )
    db.add(caregiver)
    await db.commit()
    await db.refresh(caregiver)
    return CaregiverResponse.model_validate(caregiver)


@router.get(
    "/caregivers",
    response_model=List[CaregiverResponse],
    summary="List connected caregivers",
)
async def list_caregivers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[CaregiverResponse]:
    """Retrieve list of authorized caregivers for current user."""
    query = (
        select(Caregiver)
        .where(Caregiver.user_id == current_user.id)
        .order_by(desc(Caregiver.created_at))
    )
    result = await db.execute(query)
    caregivers = result.scalars().all()
    return [CaregiverResponse.model_validate(c) for c in caregivers]


@router.patch(
    "/caregivers/{caregiver_id}/consent",
    response_model=CaregiverResponse,
    summary="Toggle consent status for a caregiver",
)
async def toggle_caregiver_consent(
    caregiver_id: int,
    payload: CaregiverConsentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CaregiverResponse:
    """Grant or revoke consent for a trusted caregiver to access health metrics."""
    query = select(Caregiver).where(
        Caregiver.id == caregiver_id, Caregiver.user_id == current_user.id
    )
    result = await db.execute(query)
    caregiver = result.scalar_one_or_none()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found")

    caregiver.consent_granted = payload.consent_granted
    caregiver.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(caregiver)
    return CaregiverResponse.model_validate(caregiver)


@router.delete(
    "/caregivers/{caregiver_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a caregiver",
)
async def remove_caregiver(
    caregiver_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a caregiver and revoke all access."""
    query = select(Caregiver).where(
        Caregiver.id == caregiver_id, Caregiver.user_id == current_user.id
    )
    result = await db.execute(query)
    caregiver = result.scalar_one_or_none()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found")
    await db.delete(caregiver)
    await db.commit()
