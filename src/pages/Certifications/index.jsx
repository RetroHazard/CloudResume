import React from "react";

import {Icon} from "@iconify-icon/react";
import CertificationList from "../../components/certification_list";

function Certifications() {
    return (
        <>
            <div className="content-block" id="certifications">
                <h2 className="h2 font-extrabold text-content-header mb-0">CERTIFICATIONS</h2>
                <div className="flex flex-col gap-8">
                   <CertificationList/>
                </div>
            </div>
        </>
    );
}

export default Certifications;