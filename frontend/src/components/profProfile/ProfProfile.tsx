import React, { useEffect, useState } from 'react';
import { fetchDocumentId, fetchPatientDetails, fetchProfessionalData } from '../../../firebase/fetchData';
import { IPsychiatrist } from '../../schema'
import Availability from './Availability';
import Image from 'next/image';
import Link from '../../assets/link.svg';
import Arrow from '../../assets/return_arrow.svg';
import Bookmark from '../../assets/bookmark2.svg';
import SavedBookmark from '../../assets/saved_bookmark2.svg';
import Chat from '../../assets/message2.svg';
import Photo from '../../assets/dummy_photo.jpg';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, logInWithGoogle, signUpWithGoogle } from '../../../firebase/firebase';
import { LoginPopup } from '../LoginPopup';
import Bookings from '../bookings/Bookings';


interface ProfProfileProps {
    firstName: string;
    lastName: string;
}

const DummyPsychiatrist = {
    id: 1,
    firstName: "Gloria",
    lastName: "Shi",
    title: "Psychiatrist at Wohohiame Hospital",
    profile_pic: null,
    availability: ["9:00-10:00, 13:00-16:30",
        "16:00-17:00",
        "19:45-21:30, 23:00-23:30",
        "8:00-9:00, 15:00-18:00",
        "9:00-10:00, 13:00-15:30",
        "8:00-9:00, 16:00-18:00, 20:00-21:30",
        ""],
    gender: 1,
    location: "Accra, Ghana",
    language: ["English"],
    specialty: ["Psychiatrist"],
    description: `Dr. Gloria Shi is a psychiatrist based in Accra, Ghana. 
    She obtained her medical degree from the University of Ghana and completed 
    her psychiatry residency training at the Korle Bu Teaching Hospital in Accra. 
    Dr. Gloria Shi is passionate about providing quality mental health care to her 
    patients and has a specialization in the treatment of anxiety and mood disorders.`
}

// Originally, { firstName, lastName }: ProfProfileProps was passed in below, 
// put it is not necessary if we are using useRouter, because we can access 
// the firstName and lastName from the router's query

const ProfProfile = () => {
    const { user } = useAuth(); // Get the user information from the context
    const [docId, setDocId] = useState<string | undefined>(undefined);
    const [showPopup, setShowPopup] = useState(false);

    // Set the initial state of professional to null instead of DummyPsychiatrist 
    // to avoid the initial rendering of the component with DummyPsychiatrist 
    // before fetching and updating with the real data
    const [professional, setProfessional] = useState<IPsychiatrist | null>(null);
    const [savedPsychiatrists, setSavedPsychiatrists] = useState<string[]>([]);

    const router = useRouter();

    // Effect for fetching and updating professional data based on query parameters.
    // This effect runs when the component mounts or when `router.query.psych_uid` change.
    useEffect(() => {
        const fetchProfessional = async () => {
            const userId = user?.uid; // Get the ID of the currently logged-in user

            // Extract the first name and last name from the router query parameters
            const psych_uid = router.query.psych_uid as string;

            // Check if both first name and last name are defined
            if (psych_uid) {
                // Fetch professional data based on first name and last name
                const data = await fetchProfessionalData(psych_uid);
                console.log(data);
                setProfessional(data);
            }
        };

        fetchProfessional();
    }, [router.query.psych_uid]);

    useEffect(() => {
        const fetchUser = async () => {
            if (user) {
                const data = await fetchPatientDetails(user.uid);
                setSavedPsychiatrists(data.savedPsychiatrists)
                console.log(savedPsychiatrists)
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchDocId = async () => {
            if (user) {
                const documentId = await fetchDocumentId("patients", user.uid);
                setDocId(documentId);
                console.log(documentId)
            }
        }
        fetchDocId();
    }, [docId]);

    const handleSave = async (event: React.MouseEvent, psychiatrist) => {
        if (!user) {
            event.preventDefault();
            setShowPopup(true);
        } else {
            try {
                const currUser = await fetchPatientDetails(user.uid);
                const updatedSavedPsychiatrists = [...savedPsychiatrists];

                // Check if the psychiatrist is already saved
                if (!savedPsychiatrists.includes(psychiatrist.uid)) {
                    // If not saved, add the psychiatrist to the savedPsychiatrists array
                    updatedSavedPsychiatrists.push(psychiatrist.uid);
                } else {
                    // If already saved, unsave it by removing the psychiatrist from the savedPsychiatrists array
                    const index = updatedSavedPsychiatrists.indexOf(psychiatrist.uid);
                    if (index !== -1) {
                        updatedSavedPsychiatrists.splice(index, 1);
                    }
                }
                setSavedPsychiatrists(updatedSavedPsychiatrists)

                // Update the result to firebase
                const userRef = doc(db, "patients", docId ?? "");
                await updateDoc(userRef, {
                    savedPsychiatrists: updatedSavedPsychiatrists
                })

            } catch (error) {
                console.error('Error saving psychiatrist');
            }
        }
    };

    const handleSendMessage = (event: React.MouseEvent) => {
        if (!user) {
            event.preventDefault();
            setShowPopup(true);
        }
    };

    const handleBookAppointment = (event: React.MouseEvent) => {
        if (!user) {
            event.preventDefault();
            setShowPopup(true);
        }
    };

    // Navigate to the user's discover page
    const handleGoToDashboard = () => {
        router.push(`/${user?.userType}/${user?.uid}/discover`);
    };

    const logInWithGoogleAndRedirect = async (onClose: () => void) => {
        await logInWithGoogle();
        router.push('/messages'); // Moved this line before the closing of the popup
        setShowPopup(false);
        onClose();
    };

    const signUpWithGoogleAndRedirect = async (onClose: () => void) => {
        router.push('/questionnaire'); // Moved this line before the closing of the popup
        setShowPopup(false);
        onClose();
    };

    // Render conditionally based on whether professional data is available
    if (professional === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`w-2/3 h-full flex flex-wrap flex-col justify-center content-center gap-5`}>
            {showPopup && <LoginPopup onClose={() => setShowPopup(false)} logInWithGoogleAndRedirect={logInWithGoogleAndRedirect} signUpWithGoogleAndRedirect={signUpWithGoogleAndRedirect} />}
            <div className={`flex flex-row`}>
                {/* Back arrow to return to go back to Discover Professionals */}
                <figure className={`cursor-pointer`} onClick={handleGoToDashboard}><Arrow /></figure>
            </div>
            <div className={`flex flex-row gap-10`}>
                <div className={`shrink`}>
                    <Image src={Photo} alt="Photo" width={1200} height={600} />
                </div>
                <div className={`grow flex flex-col gap-4`}>
                    <div className={`flex flex-row gap-4`}>
                        <div className={`grow text-3xl text-bold`}>
                            {professional.firstName + " " + professional.lastName}
                        </div>
                        {/* Save button, action is currently undefined */}
                        <div className={`shrink`}>
                            <div onClick={(event) => handleSave(event, professional)} className={`px-4 py-2 rounded-s-2xl rounded-[12px] bg-okb-blue hover:bg-light-blue transition cursor-pointer text-okb-white flex flex-row gap-2 text-semibold`}>
                                <figure className="object-cover">{savedPsychiatrists.includes(professional.uid) ? <SavedBookmark /> : <Bookmark />}</figure>Save
                            </div>
                        </div>
                        {/* Message button, action is currently undefined */}
                        <div className={`shrink`} >
                            <div onClick={handleSendMessage} className={`px-4 py-2 rounded-s-2xl rounded-[12px] bg-okb-blue hover:bg-light-blue transition cursor-pointer text-okb-white flex flex-row gap-2`}>
                                <figure className="object-cover"><Chat /></figure>Message
                            </div>
                        </div>
                    </div>
                    <div className={`text-normal text-xl italic text-dark-grey`}>
                        {professional.position}
                    </div>
                    {/* Speciality/language/location tags */}
                    <div className={`flex flex-row flex-start gap-2`}>
                        {professional.specialty.map((speciality, index) => (
                            <div className={`px-3 py-2 border-2 rounded-[20px] border-light-blue`}>
                                {speciality}
                            </div>
                        ))}
                        {professional.language.map((langauge, index) => (
                            <div className={`px-3 py-2 border-2 rounded-[20px] border-light-blue`}>
                                {langauge}
                            </div>
                        ))}
                        <div className={`px-3 py-2 border-2 rounded-[20px] border-light-blue`}>
                            {professional.location}
                        </div>

                    </div>
                    <div className={`text-normal text-base`}>
                        {professional.description}
                    </div>
                    <div className={`flex flex-row`}>
                        {/* Link tag, currently not in the IPsychiatrist so hard coded with default link */}
                        <div className="px-4 py-2 border-2 rounded-s-2xl rounded-[20px] border-light-blue bg-lightest-blue hover:shadow-xl transition cursor-pointer flex flex-row gap-2">
                            <a
                                href="https://www.wohohiame.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                <figure className="object-cover"><Link /></figure>
                                <span className="ml-2">www.mentalhealthsite.com</span>
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <h2 className={`text-bold text-2xl`}>Availability</h2>
            <Availability availability={professional?.availability} />

            <div className={`flex flex-row justify-center content-center`}>
                {/* Book Appointment button, action undefined but should lead to calendly */}
                <Bookings url={professional.calendly}></Bookings>
                <button
                    onClick={handleBookAppointment}
                >
                </button>
            </div>
        </div>
    );
};

export default ProfProfile;