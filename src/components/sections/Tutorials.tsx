"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Video, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Tutorials = () => {
    const { t } = useLanguage();
    const tutorials = [
        {
            title: "Realproxy.net Signup",
            id: "sKvu4EgSgnA",
            url: "https://youtu.be/sKvu4EgSgnA"
        },
        {
            title: "Realproxy.net bKash Nagad Payment",
            id: "O-K_a47XAe4",
            url: "https://youtu.be/O-K_a47XAe4"
        },
        {
            title: "RealProxy.net Binance Pay, Crypto Payment",
            id: "ILJ5NSYIdDM",
            url: "https://youtu.be/ILJ5NSYIdDM"
        },
        {
            title: "Realproxy.net Proxy Setup in PC",
            id: "cv2Vrh_pUMQ",
            url: "https://youtu.be/cv2Vrh_pUMQ"
        },
        {
            title: "IP setup In Super Proxy App Tun2tap",
            id: "XkCeuLWm2u4",
            url: "https://youtu.be/XkCeuLWm2u4"
        }
    ];

    return (
        <section id="tutorial-section" className="tutorial-section">
            <div className="container">
                <div className="section-header">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="badge"
                    >
                        <Video size={14} fill="currentColor" /> Learning Center
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        {t.nav.tutorial}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-desc"
                    >
                        Everything you need to know about setting up and using Real Proxy services.
                    </motion.p>
                </div>

                <div className="tutorials-grid">
                    {tutorials.map((video, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="tutorial-card"
                        >
                            <div className="video-wrapper">
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.id}`}
                                    title={video.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <div className="video-overlay">
                                    <Play size={48} fill="white" color="white" />
                                </div>
                            </div>
                            <div className="card-content">
                                <h3>{video.title}</h3>
                                <a href={video.url} target="_blank" rel="noopener noreferrer" className="watch-btn">
                                    Watch on YouTube <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .tutorial-section {
                    padding: 100px 0;
                    background-color: #f8fbff;
                    position: relative;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 60px;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    background: rgba(0, 134, 255, 0.1);
                    color: #0086FF;
                    border-radius: 100px;
                    font-size: 14px;
                    font-weight: 700;
                    margin-bottom: 16px;
                }

                h2 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #041026;
                    margin-bottom: 16px;
                }

                .section-desc {
                    color: #667085;
                    font-size: 18px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .tutorials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 32px;
                }

                .tutorial-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .tutorial-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                }

                .video-wrapper {
                    position: relative;
                    aspect-ratio: 16 / 9;
                    background: #000;
                }

                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                .video-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }

                .tutorial-card:hover .video-overlay {
                    opacity: 1;
                }

                .card-content {
                    padding: 24px;
                }

                h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #041026;
                    margin-bottom: 16px;
                    line-height: 1.4;
                }

                .watch-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #0086FF;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: gap 0.2s;
                }

                .watch-btn:hover {
                    gap: 12px;
                }

                @media (max-width: 768px) {
                    .tutorial-section { padding: 60px 0; }
                    .tutorials-grid { grid-template-columns: 1fr; }
                    h2 { font-size: 28px; }
                    .section-desc { font-size: 16px; }
                }
            `}</style>
        </section>
    );
};

export default Tutorials;
