import React, { ChangeEvent } from 'react';
import Vertical_line from "@/assets/vertical_line.svg";
import { Gender } from "@/schema";
import okb_colors from "@/colors";
import Upload from "@/assets/upload.svg";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

interface QuestionnaireProps {
    firstName: string;
    lastName: string;
    gender: Gender | undefined;
    image: string;
    handleFirstName: (event: ChangeEvent<HTMLInputElement>) => void;
    handleLastName: (event: ChangeEvent<HTMLInputElement>) => void;
    handleGender: (event: ChangeEvent<HTMLInputElement>) => void;
}

// 1st page of the Questionnaire
const NameGenderImageQuestionnaire = ({ firstName, lastName, gender, image, handleFirstName, handleLastName, handleGender }: QuestionnaireProps) => {
    return (
        <div className={`w-full h-full flex flex-wrap flex-col justify-start gap-6 p-8 pb-9`}>
            <div className={`flex text-[26px] md:text-[32px] font-semibold font-montserrat w-full`}>
                Let's start setting up your profile.
            </div>
            <div className={`flex text-[20px] md:text-2xl font-semibold font-montserrat w-full`}>
                First, let’s begin with some basic information.
            </div>
            <div className={`flex flex-col md:flex-row w-full gap-y-6`}>
                {/* First Name */}
                <div tabIndex={0} className={`flex form-control min-w-[25%] md:mr-10`}>
                    <div className={`flex flex-row gap-1`}>
                        <span className={`text-lg font-semibold mb-2`}>First Name <span className={`text-lg mb-2 text-red-600`}>*</span></span>
                    </div>
                    <div className={`flex items-center`}>
                        <Vertical_line />
                        <input type="text" value={firstName} onChange={handleFirstName} placeholder="Type here" className={`input input-bordered px-6 font-montserrat placeholder:italic w-3/4 md:w-full border-2 ml-3 rounded-2xl text-[13px]`} style={{ borderColor: okb_colors.light_blue }} />
                    </div>
                </div>
                {/* Last Name */}
                <div tabIndex={0} className={`form-control min-w-[25%] md:pr-0 `}>
                    <div className={`flex flex-row gap-1`}>
                        <span className={`text-lg font-semibold mb-2`}>Last Name <span className={`text-lg mb-2 text-red-600`}>*</span></span>
                    </div>
                    <div className={`flex items-center`}>
                        <Vertical_line />
                        <input type="text" value={lastName} onChange={handleLastName} placeholder="Type here" className={`input input-bordered px-6 font-montserrat placeholder:italic w-3/4 md:w-full border-2 ml-3 rounded-2xl text-[13px]`} style={{ borderColor: okb_colors.light_blue }} />
                    </div>
                </div>
            </div>
            <FormControl className='w-full'>
                <div className={`flex flex-row gap-1 w-full`}>
                    <span className={`text-lg font-semibold font-montserrat`}>What is your gender? <span className={`text-lg text-red-600`}>*</span></span>
                </div>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    defaultValue={gender === Gender.Male ? "male" : (gender === Gender.Female ? "female" : " ")}
                    onChange={handleGender}
                >
                    <FormControlLabel className={` ml-1 text-[14px] md:text-[18px]`} value="female" control={<Radio />} label={
                        <span style={{ fontWeight: 300 }}>
                            Female
                        </span>
                    } />
                    <FormControlLabel className={` ml-1 text-[14px] md:text-[18px]`} value="male" control={<Radio />} label={
                        <span style={{ fontWeight: 300 }}>
                            Male
                        </span>
                    } />
                    <FormControlLabel className={` ml-1 text-[14px] md:text-[18px]`} value="other" control={<Radio />} label={
                        <span style={{ fontWeight: 300 }}>
                            Other
                        </span>
                    } />
                </RadioGroup>
            </FormControl>
            <div tabIndex={0} className={`form-control min-w-[300px] md:min-w-[500px] max-w-[50%] flex flex-col items-start w-full`}>
                <span className={`text-lg font-semibold font-montserrat mb-2`}>Profile Image</span>
                <div id="Frame542" className={`flex items-center justify-center w-full gap-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="204" viewBox="0 0 4 204" fill="none">
                        <path d="M2 2L2.00001 202" stroke="#519AEB" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    <div className={`flex flex-col items-start w-full gap-2.5`}>
                        <div className={`flex w-full justify-center items-center align-center`}>
                            <div id="Frame278" className={`flex flex-col absolute items-center justify-center align-center z-20`}>
                                <Upload ></Upload>
                                <label>
                                    <span className={`font-montserrat text-xs`} style={{ color: okb_colors.dark_gray }}>Upload Image</span>
                                </label>
                            </div>
                            <div className={`input-container w-full relative z-0`}>
                                <span className={`absolute top-0 left-0 right-0 bottom-0 border-2 rounded-lg flex items-center justify-center bg-[${okb_colors.white}]`} style={{ borderColor: okb_colors.light_blue, height: 200 }}></span>
                                <input type="file" placeholder="image/" className={`input input-bordered border-2 opacity-0 w-3/4 sm:w-full`} style={{ borderColor: okb_colors.light_blue, height: 200 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NameGenderImageQuestionnaire;