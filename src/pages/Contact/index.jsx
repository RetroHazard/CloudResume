import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

function Contact() {
    return (
        <>
            <div className="content-block" id="contact">
                <h2 className="h2 font-extrabold text-content-header mb-0">CONTACT ME</h2>
                <div className="mx-auto max-w-screen-md">
                    <p className="mb-8 lg:mb-16 font-sans text-content-accent sm:text-xl">
                        Want to get in touch?
                        <br/>
                        Have a potential opportunity or project that you'd like to collaborate on?
                        <br/>
                        Feel free to reach out using the contact form below.</p>
                    <form action="#" className="space-y-8">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="flex-grow text-sm font-medium text-content-subtitle">
                                Name</label>
                            <div className="flex flex-row gap-5">
                                <input type="text" id="firstname"
                                       className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                       placeholder="John" required/>
                                <input type="text" id="lastname"
                                       className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                       placeholder="Doe" required/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-content-subtitle">
                                Email</label>
                            <input type="email" id="email"
                                   className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                   placeholder="name@email.com" required/>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-content-subtitle">
                                Subject</label>
                            <input type="text" id="subject"
                                   className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                   placeholder="What's up?" required/>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message"
                                   className="block mb-2 text-sm font-medium text-content-subtitle">
                                Your Message</label>
                            <textarea id="message" rows="4"
                                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                      placeholder="Leave a comment..."></textarea>
                        </div>
                        <button type="submit"
                                className="bg-primary-500 hover:bg-primary-400 text-secondary-800 font-bold py-2 px-4 rounded inline-flex items-center">
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