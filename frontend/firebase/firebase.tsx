import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { Gender, IUser } from "@/schema";
import router, { useRouter } from 'next/router';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_SERVICE_ACCOUNT!);
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore through Firebase
const db = getFirestore(app);

const storage = getStorage();

const providerG = new GoogleAuthProvider();

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();

const logout = () => {
  signOut(auth);
}

type GenderOrUndefined = Gender | undefined;

const logInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, new GoogleAuthProvider());
    const user = res.user;
    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      alert("An account with this email does not yet exist. Please sign up for an account first.");
      logout();
    } else {
      router.push('/');
    }
  }
  catch (err) {
    if (err instanceof Error) {
      alert('An error occurred while signing in with Google: ' + err.message);
    }
  }
};


const signUpWithGoogle = async (
  role: string,
  firstName: string,
  lastName: string,
  position: string,
  profile_pic: string,
  gender: GenderOrUndefined,
  location: string,
  language: string[],
  weeklyAvailability: string[],
  workingHours: { [key: string]: { start: string, end: string } },
  specialty: string[],
  description: string,
  concerns: string[],
  ageRange: string,
  lastTherapyTimeframe: string,
  previousTherapyExperience: string,
  prefLanguages: string[],
  genderPref: GenderOrUndefined,
  savedPsychiatrists: string[],
) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const res = await signInWithPopup(auth, providerG);
      console.log("res:", res); // Log the value of 'res'
      const user = res.user;
      console.log("user:", user);
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);

      if (docs.docs.length === 0) {
        console.log("not yet exists")
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
          userType: role
        });
        console.log("Added user")
        if (role === "psychiatrist") {
          await addDoc(collection(db, "psychiatrists"), {
            uid: user.uid,
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            profile_pic: profile_pic,
            position: position,
            location: location,
            description: description,
            language: language,
            weeklyAvailability: weeklyAvailability,
            workingHours: workingHours,
            specialty: specialty,
          });
          console.log("Added psych")
        }
        else if (role === "patient") {
          await addDoc(collection(db, "patients"), {
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            profile_pic: profile_pic,
            ageRange: ageRange,
            prefLanguages: prefLanguages,
            previousTherapyExperience: previousTherapyExperience,
            lastTherapyTimeframe: lastTherapyTimeframe,
            concerns: concerns,
            genderPref: genderPref,
            savedPsychiatrists: savedPsychiatrists
          });
          console.log("Added patient")
        }
        console.log("Updated database");
      }
      else {
        throw new Error("user already exists");
      }
      resolve(); // Resolve the promise once sign-in is complete
    } catch (err) {
      if (err instanceof Error) {
        reject(err); // Reject the promise if an error occurs during sign-in
        alert("this email is already in use by an existing account");
        logout();
        return;
      }
    }
  });
};

const saveResponses = async (userId: string, responses: any) => {
  const responsesRef = doc(db, "responses", userId);
  await setDoc(responsesRef, { userId, responses });
};

const fetchRole = async (uid: string) => {
  try {
    const q = query(
      collection(db, "users"),
      where("uid", "==", uid)
    );
    const response = await getDocs(q);
    if (!response.empty) {
      const doc = response.docs[0];
      const docId = doc.id;
      const docData = response.docs[0].data();
      const user = docData as IUser;
      return user.userType;
    } else {
      throw new Error(`No user found with the uid: ${uid}`)
    }
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
}

const fetchUser = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
};

const updateUser = async (userId: string, data: any) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, data, { merge: true });
};

async function uploadPicture(file, userUID, setLoading) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const storageRef = ref(storage, 'profile_pictures/' + userUID + '.png');
    setLoading(true);
    try {
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: photoURL });
      alert("Uploaded file!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  } else {
    alert("No authenticated user found.");
  }
}


export { auth, db, app, logInWithGoogle, signUpWithGoogle, logout, fetchRole, fetchUser, updateUser, saveResponses, uploadPicture };

