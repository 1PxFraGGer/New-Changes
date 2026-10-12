import { useEffect, useState } from "react";
import api from "../api/api";
import "./CounsellingModal.css";

export default function CounsellingModal({
  show,
  onClose,
  university,
}) {
  /* =====================================================
     STATES
  ===================================================== */

  const [allPrograms, setAllPrograms] = useState([]);

  const [courses, setCourses] = useState([]);

  const [programs, setPrograms] = useState([]);

  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [loadingPrograms, setLoadingPrograms] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    university_id: "",
    course_id: "",
    program_id: "",
    message: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getListFromResponse = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.courses)) {
      return data.courses;
    }

    if (Array.isArray(data?.programs)) {
      return data.programs;
    }

    return [];
  };

  /* =====================================================
     GET COURSE ID
  ===================================================== */

  const getCourseId = (item) => {
    return (
      item?.course_id ??
      item?.courseId ??
      item?.course?.id ??
      item?.course?.documentId ??
      item?.course?.data?.id ??
      item?.course?.data?.documentId ??
      null
    );
  };

  /* =====================================================
     GET COURSE NAME
  ===================================================== */

  const getCourseName = (item) => {
    return (
      item?.course_name ??
      item?.courseName ??
      item?.course?.name ??
      item?.course?.title ??
      item?.course?.course_name ??
      item?.course?.data?.name ??
      item?.course?.data?.title ??
      item?.course?.data?.course_name ??
      ""
    );
  };

  /* =====================================================
     GET DIRECT COURSE ID
  ===================================================== */

  const getDirectCourseId = (course) => {
    return (
      course?.id ??
      course?.documentId ??
      course?.course_id ??
      course?.courseId ??
      null
    );
  };

  /* =====================================================
     GET DIRECT COURSE NAME
  ===================================================== */

  const getDirectCourseName = (course) => {
    return (
      course?.name ??
      course?.title ??
      course?.course_name ??
      course?.courseName ??
      course?.program_name ??
      course?.programName ??
      ""
    );
  };

  /* =====================================================
     GET PROGRAM ID
  ===================================================== */

  const getProgramId = (program) => {
    return (
      program?.id ??
      program?.documentId ??
      program?.program_id ??
      program?.programId ??
      null
    );
  };

  /* =====================================================
     GET PROGRAM NAME
  ===================================================== */

  const getProgramName = (program) => {
    return (
      program?.name ??
      program?.title ??
      program?.program_name ??
      program?.programName ??
      program?.specialization_name ??
      program?.specializationName ??
      program?.specialization ??
      program?.branch_name ??
      program?.branchName ??
      ""
    );
  };

  /* =====================================================
     LOAD CURRENT UNIVERSITY + COURSES
  ===================================================== */

  useEffect(() => {
    if (!show || !university) return;

    setFormData((prev) => ({
      ...prev,
      university_id: university.id || "",
      course_id: "",
      program_id: "",
    }));

    setAllPrograms([]);
    setCourses([]);
    setPrograms([]);

    setError("");
    setSuccess("");

    if (university.id) {
      loadCourses(university.id);
    }
  }, [show, university]);

  /* =====================================================
     LOAD COURSES
  ===================================================== */

  const loadCourses = async (universityId) => {
    if (!universityId) {
      setCourses([]);
      setPrograms([]);
      setAllPrograms([]);
      return;
    }

    try {
      setLoadingCourses(true);
      setError("");

      /* =================================================
         FIRST TRY:
         DIRECT UNIVERSITY COURSES API
      ================================================= */

      try {
        const courseResponse = await api.get(
          `/public/universities/${universityId}/courses`
        );

        console.log(
          "DIRECT COURSES API RESPONSE:",
          courseResponse.data
        );

        const courseList =
          getListFromResponse(courseResponse);

        if (courseList.length > 0) {
          const normalizedCourses = courseList
            .map((course) => {
              const id =
                getDirectCourseId(course);

              const name =
                getDirectCourseName(course);

              if (!id || !name) {
                return null;
              }

              return {
                ...course,
                id,
                name,
              };
            })
            .filter(Boolean);

          console.log(
            "NORMALIZED COURSES:",
            normalizedCourses
          );

          if (normalizedCourses.length > 0) {
            setCourses(normalizedCourses);

            /*
             Also load all programs in the background
             so we have a fallback if course-program API
             does not exist.
            */

            await loadAllProgramsForFallback(
              universityId
            );

            return;
          }
        }
      } catch (courseApiError) {
        console.warn(
          "Direct courses endpoint unavailable. Using programs fallback.",
          courseApiError?.response?.status ||
            courseApiError?.message
        );
      }

      /* =================================================
         FALLBACK:
         LOAD ALL PROGRAMS AND EXTRACT COURSES
      ================================================= */

      const response = await api.get(
        `/public/universities/${universityId}/programs`
      );

      console.log(
        "FALLBACK PROGRAMS API RESPONSE:",
        response.data
      );

      const list = getListFromResponse(response);

      setAllPrograms(list);

      const courseMap = new Map();

      list.forEach((program) => {
        const courseId =
          getCourseId(program);

        const courseName =
          getCourseName(program);

        if (
          courseId !== null &&
          courseId !== undefined &&
          courseName
        ) {
          const key = String(courseId);

          if (!courseMap.has(key)) {
            courseMap.set(key, {
              id: courseId,
              name: courseName,
            });
          }
        }
      });

      const uniqueCourses = Array.from(
        courseMap.values()
      );

      console.log(
        "COURSES EXTRACTED FROM PROGRAMS:",
        uniqueCourses
      );

      setCourses(uniqueCourses);

      if (uniqueCourses.length === 0) {
        console.warn(
          "No course relationship found inside program response."
        );

        setError(
          "Courses could not be identified from the university data."
        );
      }
    } catch (err) {
      console.error(
        "Failed to load courses:",
        err
      );

      setCourses([]);
      setPrograms([]);
      setAllPrograms([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load courses. Please try again."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  /* =====================================================
     LOAD ALL PROGRAMS FOR FALLBACK
  ===================================================== */

  const loadAllProgramsForFallback =
    async (universityId) => {
      try {
        const response = await api.get(
          `/public/universities/${universityId}/programs`
        );

        const list =
          getListFromResponse(response);

        console.log(
          "ALL PROGRAMS FALLBACK:",
          list
        );

        setAllPrograms(list);
      } catch (err) {
        console.warn(
          "Could not preload programs fallback:",
          err?.response?.status ||
            err?.message
        );

        setAllPrograms([]);
      }
    };

  /* =====================================================
     LOAD PROGRAMS BY COURSE
  ===================================================== */

  const loadPrograms = async (
    universityId,
    courseId
  ) => {
    if (!universityId || !courseId) {
      setPrograms([]);
      return;
    }

    try {
      setLoadingPrograms(true);
      setPrograms([]);
      setError("");

      /* =================================================
         FIRST TRY:
         COURSE SPECIFIC PROGRAM API
      ================================================= */

      try {
        const response = await api.get(
          `/public/universities/${universityId}/courses/${courseId}/programs`
        );

        console.log(
          "COURSE PROGRAMS API RESPONSE:",
          response.data
        );

        const list =
          getListFromResponse(response);

        if (list.length > 0) {
          setPrograms(list);
          return;
        }
      } catch (programApiError) {
        console.warn(
          "Course-specific programs endpoint unavailable. Using fallback filtering.",
          programApiError?.response?.status ||
            programApiError?.message
        );
      }

      /* =================================================
         FALLBACK:
         FILTER PRELOADED PROGRAMS
      ================================================= */

      let programsSource = allPrograms;

      /*
       If programs were not preloaded,
       load them again.
      */

      if (programsSource.length === 0) {
        try {
          const response = await api.get(
            `/public/universities/${universityId}/programs`
          );

          programsSource =
            getListFromResponse(response);

          setAllPrograms(programsSource);
        } catch (err) {
          console.error(
            "Unable to load fallback programs:",
            err
          );

          programsSource = [];
        }
      }

      const filteredPrograms =
        programsSource.filter((program) => {
          const programCourseId =
            getCourseId(program);

          return (
            programCourseId !== null &&
            programCourseId !== undefined &&
            String(programCourseId) ===
              String(courseId)
          );
        });

      console.log(
        "FILTERED PROGRAMS:",
        filteredPrograms
      );

      setPrograms(filteredPrograms);

      if (filteredPrograms.length === 0) {
        console.warn(
          "No programs found for selected course:",
          courseId
        );
      }
    } catch (err) {
      console.error(
        "Failed to load programs:",
        err
      );

      setPrograms([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load programs. Please try again."
      );
    } finally {
      setLoadingPrograms(false);
    }
  };

  /* =====================================================
     HANDLE NORMAL INPUT
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =====================================================
     HANDLE COURSE CHANGE
  ===================================================== */

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      course_id: courseId,
      program_id: "",
    }));

    setPrograms([]);

    setError("");
    setSuccess("");

    if (!courseId) {
      return;
    }

    console.log(
      "SELECTED COURSE ID:",
      courseId
    );

    await loadPrograms(
      university?.id,
      courseId
    );
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    if (submitting) return;

    setError("");
    setSuccess("");

    onClose();
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* ================= VALIDATION ================= */

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.mobile.trim()) {
      setError(
        "Please enter your mobile number."
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        formData.mobile.trim()
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!formData.email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!university?.id) {
      setError(
        "University information is missing."
      );
      return;
    }

    if (!formData.course_id) {
      setError(
        "Please select a course."
      );
      return;
    }

    if (!formData.program_id) {
      setError(
        "Please select a program or specialization."
      );
      return;
    }

    /* ================= SELECTED COURSE ================= */

    const selectedCourse = courses.find(
      (course) =>
        String(
          getDirectCourseId(course)
        ) ===
        String(formData.course_id)
    );

    const courseName =
      getDirectCourseName(
        selectedCourse
      );

    if (!courseName) {
      setError(
        "Unable to identify the selected course."
      );
      return;
    }

    /* ================= SELECTED PROGRAM ================= */

    const selectedProgram = programs.find(
      (program) =>
        String(
          getProgramId(program)
        ) ===
        String(formData.program_id)
    );

    const programName =
      getProgramName(
        selectedProgram
      );

    if (!programName) {
      setError(
        "Unable to identify the selected program."
      );
      return;
    }

    /* ================= SUBMIT ================= */

    try {
      setSubmitting(true);

      const payload = {
        name:
          formData.name.trim(),

        mobile:
          formData.mobile.trim(),

        email:
          formData.email.trim(),

        university_id:
          university.id,

        university_name:
          university.name || "",

        course_id:
          formData.course_id,

        course_name:
          courseName,

        program_id:
          formData.program_id,

        program_name:
          programName,

        message:
          formData.message.trim(),
      };

      console.log(
        "COUNSELLING REQUEST:",
        payload
      );

      const response = await api.post(
        "/public/counselling",
        payload
      );

      console.log(
        "COUNSELLING RESPONSE:",
        response.data
      );

      /* ================= SUCCESS ================= */

      setSuccess(
        "Thank you! Our counsellor will contact you shortly."
      );

      setTimeout(() => {
        setFormData({
          name: "",
          mobile: "",
          email: "",
          university_id:
            university?.id || "",
          course_id: "",
          program_id: "",
          message: "",
        });

        setPrograms([]);

        onClose();

        setSuccess("");
      }, 2200);
    } catch (err) {
      console.error(
        "Counselling enquiry error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to submit your counselling request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DON'T SHOW
  ===================================================== */

  if (!show) return null;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="counselling-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !submitting
        ) {
          handleClose();
        }
      }}
    >
      {/* Floating background decorations */}

      <div className="counselling-floating-shape shape-one" />

      <div className="counselling-floating-shape shape-two" />

      <div className="counselling-floating-shape shape-three" />

      {/* =================================================
          MODAL
      ================================================= */}

      <div className="counselling-modal">
        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <div className="counselling-info">
          <button
            className="mobile-close"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>

          <div className="counselling-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
              alt="Education counselling"
              className="counselling-image"
            />

            <div className="image-overlay" />

            <div className="image-content">
              <div className="image-badge">
                🎓 FREE COUNSELLING
              </div>

              <h2>
                Your Education.
                <br />
                Your Future.
              </h2>

              <p>
                Get personalised guidance from
                our education counsellors.
              </p>
            </div>
          </div>

          {/* Benefits */}

          <div className="counselling-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                🎓
              </div>

              <div>
                <strong>
                  Course Guidance
                </strong>

                <span>
                  Choose the right course for
                  your goals
                </span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                🏫
              </div>

              <div>
                <strong>
                  University Guidance
                </strong>

                <span>
                  Understand your university
                  options
                </span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                💬
              </div>

              <div>
                <strong>
                  Personalised Support
                </strong>

                <span>
                  Speak directly with our
                  counsellors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            RIGHT FORM
        ================================================= */}

        <div className="counselling-form-panel">
          {/* Close */}

          <button
            type="button"
            className="desktop-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}

          <div className="counselling-form-header">
            <span className="form-eyebrow">
              ✨ TALK TO AN EXPERT
            </span>

            <h2>
              Get Free Counselling
            </h2>

            <p>
              Fill in your details and we'll
              help you make the right choice.
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="counselling-form"
            onSubmit={handleSubmit}
          >
            {/* NAME */}

            <div className="form-group">
              <label>
                Full Name <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* MOBILE */}

            <div className="form-group">
              <label>
                Mobile Number <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  📱
                </span>

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>
                Email Address <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  ✉️
                </span>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* UNIVERSITY */}

            <div className="form-group">
              <label>
                University
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  🏛️
                </span>

                <input
                  type="text"
                  value={
                    university?.name || ""
                  }
                  readOnly
                  disabled={submitting}
                />
              </div>
            </div>

            {/* =================================================
                COURSE
            ================================================= */}

            <div className="form-group">
              <label>
                Interested Course{" "}
                <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  📚
                </span>

                <select
                  name="course_id"
                  value={
                    formData.course_id
                  }
                  onChange={
                    handleCourseChange
                  }
                  disabled={
                    submitting ||
                    loadingCourses
                  }
                >
                  <option value="">
                    {loadingCourses
                      ? "Loading courses..."
                      : courses.length === 0
                      ? "No courses available"
                      : "Select your course"}
                  </option>

                  {courses.map(
                    (course) => {
                      const courseId =
                        getDirectCourseId(
                          course
                        );

                      const courseName =
                        getDirectCourseName(
                          course
                        );

                      return (
                        <option
                          key={
                            courseId
                          }
                          value={
                            courseId
                          }
                        >
                          {courseName ||
                            `Course ${courseId}`}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            </div>

            {/* =================================================
                PROGRAM / SPECIALIZATION
            ================================================= */}

            <div className="form-group">
              <label>
                Program / Specialization{" "}
                <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  🎓
                </span>

                <select
                  name="program_id"
                  value={
                    formData.program_id
                  }
                  onChange={handleChange}
                  disabled={
                    submitting ||
                    !formData.course_id ||
                    loadingPrograms
                  }
                >
                  <option value="">
                    {!formData.course_id
                      ? "Select course first"
                      : loadingPrograms
                      ? "Loading programs..."
                      : programs.length ===
                        0
                      ? "No programs available"
                      : "Select program / specialization"}
                  </option>

                  {programs.map(
                    (program) => {
                      const programId =
                        getProgramId(
                          program
                        );

                      const programName =
                        getProgramName(
                          program
                        );

                      return (
                        <option
                          key={
                            programId
                          }
                          value={
                            programId
                          }
                        >
                          {programName ||
                            `Program ${programId}`}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            </div>

            {/* MESSAGE */}

            <div className="form-group full-width">
              <label>
                How can we help you?
              </label>

              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon textarea-icon">
                  💬
                </span>

                <textarea
                  name="message"
                  value={
                    formData.message
                  }
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="counselling-error">
                <span>⚠️</span>

                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="counselling-success">
                <span className="success-check">
                  ✓
                </span>

                <div>
                  <strong>
                    Request Submitted!
                  </strong>

                  <small>
                    Our counsellor will
                    contact you shortly.
                  </small>
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="counselling-submit"
              disabled={
                submitting ||
                loadingCourses ||
                loadingPrograms
              }
            >
              {submitting ? (
                <>
                  <span className="submit-spinner" />

                  Submitting...
                </>
              ) : (
                <>
                  Get Free Counselling

                  <span className="submit-arrow">
                    →
                  </span>
                </>
              )}
            </button>

            <div className="secure-note">
              🔒 Your information is safe
              and will only be used for
              counselling.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}