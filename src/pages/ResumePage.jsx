import React, { useState, useEffect } from "react";
import { notification } from "antd";
import Resume from "../components/resume/Resume";
import { createResumeAPI, deleteResumeAPI, fetchResumeListAPI } from "../services/api.resume";

const ResumePage = () => {
    const [resumes, setResumes] = useState([]); // Dữ liệu phân trang
    const [fullResumes, setFullResumes] = useState([]); // Toàn bộ dữ liệu
    const [totalResumes, setTotalResumes] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const fetchResumes = async (page = 1, size = pageSize) => {
        setLoading(true);
        try {
            // Lấy dữ liệu phân trang
            const response = await fetchResumeListAPI(page, size);
            const resumeList = Array.isArray(response?.data?.result) ? response.data.result : [];
            setResumes(resumeList);
            setTotalResumes(response?.data?.meta?.total || 0);

            // Lấy toàn bộ dữ liệu
            const fullResponse = await fetchResumeListAPI(1, 1000); // Giả sử 1000 là đủ lớn để lấy hết dữ liệu
            const fullResumeList = Array.isArray(fullResponse?.data?.result) ? fullResponse.data.result : [];
            setFullResumes(fullResumeList);

            // console.log("API Response (Paginated):", response);
            // console.log("API Response (Full):", fullResponse);
        } catch (error) {
            // console.error("Error fetching resumes:", error);
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy danh sách resume.",
            });
            setResumes([]);
            setFullResumes([]);
            setTotalResumes(0);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResume = async (values) => {
        setLoading(true);
        try {
            await createResumeAPI(values);
            await fetchResumes(currentPage, pageSize);
        } catch (error) {
            throw error;
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
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchResumes(currentPage, pageSize);
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
        <div>
            <h2 className="resume-title" style={{ color: "#1d39c4" }}>
                Danh Sách Resume
            </h2>
            <Resume
                resumes={resumes}
                fullResumes={fullResumes} // Truyền toàn bộ dữ liệu
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalResumes={totalResumes}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onCreateResume={handleCreateResume}
                onDeleteResume={handleDeleteResume}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default ResumePage;