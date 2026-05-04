import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isJobSeekerShow: false,
    isCompanyShow: false,
    activeData: null,
    interviews: null,
    reload: 0,

    interviewPopup: false,
    activeInterviewData: null,

    sharePopup: false,
    shareData: null,

    rescheduledPopup: false,
    rescheduledData: null,

    type: "",

    jobTargetPopup: false,
    jobTargetData: null,

    addCandidatePopup: false,
    addCandidateData: null,
    editData: null,

    isTrainingShow: false,

    allSkills : [],
    voicesList: [],
};

const popupSlice = createSlice({
    name: "popupSlice",
    initialState,
    reducers: {
        setJobSeeker: (state, { payload: { isActive, activeData, interviews } }) => {
            state.isCompanyShow = false;
            state.isJobSeekerShow = isActive;
            state.activeData = activeData;
	    state.interviews = interviews
        },
        setCompany: (state, { payload: { isActive, activeData } }) => {
            state.isJobSeekerShow = false;
            state.isCompanyShow = isActive;
            state.activeData = activeData;
        },
        setReload: (state, { payload }) => {
            state.reload = Math.random();
        },

        setInterviewPopup: (state, { payload }) => {
            state.interviewPopup = payload.state;
            state.activeInterviewData = payload.data;
        },

        setSharePopup: (state, { payload }) => {
            state.sharePopup = payload.state;
            state.shareData = payload.data;
        },

        setRescheduledPopup: (state, { payload }) => {
            state.rescheduledPopup = payload.state;
            state.rescheduledData = payload.data;
        },

        setType: (state, { payload }) => {
            state.type = payload;
        },

        setJobTarge: (state, { payload }) => {
            state.jobTargetPopup = payload.state;
            state.jobTargetData = payload.data;
        },

        setCandidatePopup: (state, { payload }) => {
            state.addCandidatePopup = payload.state;
            state.addCandidateData = payload.data;
            state.editData = payload.data;
        },

        setTrainingPopup: (state, { payload }) => {
            state.isTrainingShow = payload.state;
            state.editData = payload.data;
        },

        setAllSkills: (state, { payload }) => {
            state.allSkills = payload
        },

        setVoicesList: (state, { payload }) => {
            state.voicesList = payload;
        },
    },
});

export const {
    setJobSeeker,
    setCompany,
    setReload,
    setInterviewPopup,
    setSharePopup,
    setRescheduledPopup,
    setType,
    setJobTarge,
    setCandidatePopup,
    setTrainingPopup,
    setAllSkills,
    setVoicesList
} = popupSlice.actions;

export default popupSlice.reducer;
