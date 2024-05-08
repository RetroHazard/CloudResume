import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

function Contact() {
    return (
        <>
            <div className="content-block" id="contact">
                <h2 className="h2 font-extrabold text-content-header mb-0">CONTACT ME</h2>
                <div className="mx-auto max-w-screen-md">
                    <p className="mb-6 font-sans text-content-accent sm:text-xl">
                        Have a potential opportunity or project that you'd like to collaborate on?
                        <br/>
                        Feel free to reach out using the contact form below.</p>
                    <form action="#" className="space-y-8">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-content-subtitle">Name</label>
                            <div className="flex flex-row gap-6">
                                <input type="text" id="firstname" className="text-entry" placeholder="First Name" required/>
                                <input type="text" id="lastname" className="text-entry" placeholder="Last Name" required/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-content-subtitle">Email</label>
                            <input type="email" id="email" className="text-entry" placeholder="name@email.com" required/>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-content-subtitle">Subject</label>
                            <input type="text" id="subject" className="text-entry" placeholder="What's up?" required/>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block mb-2 text-sm font-medium text-content-subtitle">Your Message</label>
                            <textarea id="message" rows="4" className="text-entry" placeholder="Leave a comment..."></textarea>
                        </div>
                        <button type="submit" className="bg-primary-500 hover:bg-primary-400 text-secondary-800 font-bold py-2 px-4 rounded inline-flex items-center">
                            <div className="icon-box">
                                <i className="w-5 h-5 mr-2 text-content-icons">
                                    <FontAwesomeIcon icon={faPaperPlane}/>
                                </i>
                            </div>
                            <span className="text-content-header text-sm">Send Message</span>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Contact;