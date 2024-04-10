import { useEffect, useState } from 'react';
import { fetchAllPatients } from '../../../firebase/fetchGraphData';
import { IPatient } from '@/schema';

interface PatientListProps {
  questionType: string;
  ageRanges: string[];
  genders: number[];
  languages: string[];
  setGlobalMen: Function;
  setGlobalWomen: Function;
  setGlobalOther: Function;
}

const PatientList: React.FC<PatientListProps> = ({ questionType, ageRanges, genders, languages, setGlobalMen, setGlobalWomen, setGlobalOther }) => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  let men: number[] = [];
  let women: number[] = [];
  let other: number[] = [];

  const allConcerns: string[] = [
    "My Relationships",
    "Addiction",
    "Suicidal Thoughts",
    "Family Distress",
    "Substance Abuse",
    "Academic Distress",
    "Social Anxiety",
    "Depression",
    "Other"
  ];

  const allTimeFrames: string[] = [
    "within-last-month",
    "within-last-6-months",
    "within-last-year",
    "over-a-year-ago",
    "I have never spoken with a counselor/therapist before."
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("fetched patients")
        const fetchPatients = await fetchAllPatients();
        setPatients(fetchPatients);
        console.log("finished fetching patients")
      } catch (err: any) {
        console.error(err.message);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    console.log(patients);
  }, [patients]);

  useEffect(() => {
    async function filterData() {
      try {
        console.log("filtered patients")
        if (questionType === "When was the last time you spoke with a counselor?") {
          filterTimeFrame();
        } else {
          filterConcern();
        }
        console.log("finished filtering patients")
      } catch (err: any) {
        console.error(err.message);
      }
    }
    filterData();
  }, [questionType, ageRanges, genders, languages]);

  function filterPatientsByConcern(
    patients: IPatient[],
    concern: string,
    globalAgeRanges: string[],
    gender: number[],
    languages: string[]
  ): number[] {

    // Filter patients based on concern, gender, and languages
    const filteredPatients = patients.filter(patient =>
      patient.concerns.includes(concern) &&
      globalAgeRanges.includes(patient.ageRange) &&
      gender.includes(patient.gender) &&
      patient.prefLanguages.some(language => languages.includes(language))
    );

    // Count male, female, and other patients
    const maleCount = filteredPatients.filter(patient => patient.gender === 0).length;
    const femaleCount = filteredPatients.filter(patient => patient.gender === 1).length;
    const otherCount = filteredPatients.filter(patient => patient.gender === 2).length;

    return [maleCount, femaleCount, otherCount];
  }

  function filterPatientsByTimeFrame(
    patients: IPatient[],
    timeframe: string,
    globalAgeRanges: string[],
    gender: number[],
    languages: string[]
  ): number[] {

    // Filter patients based on concern, gender, and languages
    const filteredPatients = patients.filter(patient =>
      patient.lastTherapyTimeframe.includes(timeframe) &&
      globalAgeRanges.includes(patient.ageRange) &&
      gender.includes(patient.gender) &&
      patient.prefLanguages.some(language => languages.includes(language))
    );

    // Count male, female, and other patients
    const maleCount = filteredPatients.filter(patient => patient.gender === 0).length;
    const femaleCount = filteredPatients.filter(patient => patient.gender === 1).length;
    const otherCount = filteredPatients.filter(patient => patient.gender === 2).length;

    return [maleCount, femaleCount, otherCount];
  }

  function filterConcern() {
    allConcerns.forEach(concern => {
      const patientCounts = filterPatientsByConcern(patients, concern, ageRanges, genders, languages);
      men.push(patientCounts[0]);
      women.push(patientCounts[1]);
      other.push(patientCounts[2]);
    });

    setGlobalMen(men);
    setGlobalWomen(women);
    setGlobalOther(other);
  }

  function filterTimeFrame() {
    allTimeFrames.forEach(timeframe => {
      const patientCounts = filterPatientsByTimeFrame(patients, timeframe, ageRanges, genders, languages);
      men.push(patientCounts[0]);
      women.push(patientCounts[1]);
      other.push(patientCounts[2]);
    });

    setGlobalMen(men);
    setGlobalWomen(women);
    setGlobalOther(other);
  }


  // Loop through each concern and count patients
  //  function pushInformation() {
  // allConcerns.forEach(concern => {
  //   const patientCounts = filterPatientsByConcern(patients, concern, ageRanges, genders, languages);
  //   men.push(patientCounts[0]);
  //   women.push(patientCounts[1]);
  //   other.push(patientCounts[2]);
  // });

  // setGlobalMen(men);
  // setGlobalWomen(women);
  // setGlobalOther(other);
  // console.log(men);
  // console.log(women);
  // console.log(other);
  // console.log(ageRanges);

  // }

  // if (patients.length === 0) {
  //   // Patients list is empty
  //   console.log("Patients list is empty");
  // } else {
  //   // Patients list is not empty
  //   console.log("Patients list is not empty");
  // }

  return (
    <>
      <div>

        {/* <div>
        {filterPatientsByConcern(patients, "Addiction", ["18-24"], [0, 1, 2], ["Ewe", "Hausa", "Ga", "Fante", "English", "Other"])}
      </div><div>
        {filterPatientsByConcern(patients, "Depression", ["18-24"], [0, 1], ["Hausa", "English", "Other"])}
      </div><div>
        {filterPatientsByConcern(patients, "My  Relationships", ["18-24"], [0, 1], ["Hausa", "English", "Other"])}
      </div>
      <div>
        {results.map((patient, index) => (
          <div key={index}>
            <p>{`Patient ${index + 1}`}</p>
          </div>))}
      </div> */}

      </div>
    </>
  )
};


export default PatientList;