// src/pages/ResumePage.jsx
import React, { useState, useEffect } from "react";
import { notification } from "antd";
import Resume from "../components/resume/Resume";
import { createResumeAPI, deleteResumeAPI, fetchResumeListAPI } from "../services/api.resume";

const ResumePage = () => {
    const [resumes, setResumes] = useState([]);
    const [totalResumes, setTotalResumes] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const fetchResumes = async (page = 1, size = pageSize) => {
        setLoading(true);
        try {
            const response = await fetchResumeListAPI(page, size);
            setResumes(response.data || []);
            setTotalResumes(response.total || response.data.length || 0);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy danh sách resume.",
            });
            setResumes([]);
            setTotalResumes(0);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResume = async (values) => {
        setLoading(true);
        try {
            await createResumeAPI(values);
            await fetchResumeListAPI(currentPage, pageSize);
        } catch (error) {
            throw error; // Để component Resume xử lý lỗi
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async (id) => {
        setLoading(true);
        try {
            await deleteResumeAPI(id);
            await fetchResumes(currentPage, pageSize);
        } catch (error) {
            throw error; // Để component Resume xử lý lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (current, size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className="resume-page-container">
            <h2>Danh Sách Resume</h2>
            <Resume
                resumes={resumes}
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalResumes={totalResumes}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onCreateResume={handleCreateResume}
                onDeleteResume={handleDeleteResume}
            />
        </div>
    );
};

export default ResumePage;