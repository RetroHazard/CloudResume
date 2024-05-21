import React from "react";

import SkillHighlight from "../../components/skill_highlight";
import SkillButton from "../../components/skill_button";
import LanguageItem from "../../components/language_item";

function Skills() {
    return (
        <>
            <div className="content-block" id="skills">
                <h2 className="h2 font-extrabold text-content-header mb-0">SKILLS</h2>
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-3">
                        <SkillHighlight/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="h3 text-content-subtitle font-extrabold mb-0">Interested in:</h3>
                        <SkillButton/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="h3 text-content-subtitle font-extrabold mb-0">I speak</h3>
                        <LanguageItem/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Skills;