import { Timestamp } from "firebase/firestore";

export enum Gender {
    Male = 0,
    Female = 1,
    Other = 2
}

export interface IPsychiatrist {
    uid: string;
    firstName: string;
    lastName: string;
    position: string;
    profile_pic: null;
    availability: string[]; //changed to string so it just stores the availability doc id
    gender: Gender;
    location: string;
    language: string[];
    specialty: string[];
    description: string;
    website: string;
    weeklyAvailability: string[];
    status: string;
}

export interface IPatient {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    concerns: string[];
    previousTherapyExperience: string;
    lastTherapyTimeframe: string;
    ageRange: string;
    prefLanguages: string[];
    gender: Gender;
    savedPsychiatrists: string[];
}

export interface IAvailability {
    availId: string;
    profId: string;
    startTime: Timestamp;
    endTime: Timestamp;
}


export interface IAppointment extends IAvailability {
    appointId: string;
    patientId: string;
}

export interface IUser {
    uid: string;
    authProvider: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    language: string[];
    genderPref: Gender;
    userType: string;
}

export interface IReport {
    description: string;
    patient_id: string;
    psych_id: string;
    report_id: string
    submittedAt: Timestamp;
}

