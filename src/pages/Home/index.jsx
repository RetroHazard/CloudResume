import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCloudDownload, } from "@fortawesome/free-solid-svg-icons";
import { faLinkedinIn, faGithub, faArtstation, faInstagram } from "@fortawesome/free-brands-svg-icons";

function Home() {
    return (
        <>
            <div className="content-block" id="profile">
                <div className="flex flex-col gap-6 items-start sm:flex-row">
                    <div className="flex items-center gap-4 sm:flex-col">
                        <img className="rounded-lg h-24 max-w-none md:h-52 md:w-52 sm:h-36 sm:w-36 w-24" src="/images/placeholder.png" alt="" />
                        <a href="." className="font-bold"> {/* TODO: Retrieve CV File from S3 */}
                            <button className="bg-primary-500 hover:bg-primary-400 text-secondary-800 font-bold py-2 px-4 rounded inline-flex items-center">
                                <div className="icon-box">
                                    <i className="w-5 h-5 mr-2 text-content-icons"><FontAwesomeIcon icon={faCloudDownload} size="lg" /></i>
                                </div>
                                <span className="text-content-header text-sm">Download CV</span>
                            </button>
                        </a>
                    </div>
                    <div className="flex flex-col w-full gap-5">
                        <div className="flex flex-col w-full gap-2 justify-between sm:flex-row">
                            <div className="w-full"> {/* TODO: Write Function to Automatically Retrieve Name and Job Title */}
                                <h1 className="h1 font-extrabold text-content-header mb-0">(NAME)</h1>
                                <h2 className="sm:text-lg text-base font-medium text-content-header mb-0">(JOB_TITLE)</h2>
                            </div>
                            <div className="flex gap-3 flex-wrap sm:flex-nowrap"> {/* TODO: Write Function to Automatically Build Social Buttons */}
                                <a className="social-link" href="." aria-label="LinkedIn">
                                    <i className="text-base text-content-icons"><FontAwesomeIcon icon={faLinkedinIn} size={"lg"}/></i>
                                </a>
                                <a className="social-link" href="." aria-label="Github">
                                    <i className="text-base text-content-icons"><FontAwesomeIcon icon={faGithub} size={"lg"}/></i>
                                </a>
                                <a className="social-link" href="." aria-label="ArtStation">
                                    <i className="text-base text-content-icons"><FontAwesomeIcon icon={faArtstation} size={"lg"}/></i>
                                </a>
                                <a className="social-link" href="." aria-label="Instagram">
                                    <i className="text-base text-content-icons"><FontAwesomeIcon icon={faInstagram} size={"lg"}/></i>
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="inline-grid xl:grid-cols-[auto_auto]"> {/* TODO: Write Function to Automatically Retrieve Location and Salary */}
                                <div>
                                    <span className="font-medium text-content-subtitle">Location: </span>
                                    <span className="text-content-accent">(LOCATION)</span>
                                </div>
                                <div>
                                    <span className="font-medium text-content-subtitle"></span>
                                </div>
                                <div>
                                    <span className="font-medium text-content-subtitle">Salary: </span>
                                    <span className="text-content-accent">(SALARY) (CURRENCY)</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4"> {/* TODO: Write Function to Automatically Retrieve Content from File(?) */}
                                <p className="leading-relaxed mb-0 text-sm sm:text-base sm:leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui
                                    at <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <a href="/public">vehicula</a>. Nulla lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus elit ut nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut imperdiet vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo. Pellentesque posuere justo vitae massa volutpat maximus.
                                </p>
                                <p className="leading-relaxed mb-0 text-sm sm:text-base sm:leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <a href="/public">vehicula</a>. Nulla lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus elit ut nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut imperdiet vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo. Pellentesque posuere justo vitae massa volutpat maximus.
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <div className="open-for-block">Open for work</div>
                                    <div className="open-for-block">Available for consulting</div>
                                    <div className="open-for-block">Working on side project</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;