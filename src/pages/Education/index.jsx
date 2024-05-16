import React from "react";
import EducationList from "../../components/education_list";

function Education() {
    return (
        <>
            <div className="content-block" id="education">
                <h2 className="h2 font-extrabold text-content-header mb-0">EDUCATION</h2>
               <EducationList />
            </div>
        </>
    );
}

export default Education;