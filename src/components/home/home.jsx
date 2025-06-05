import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography, Select, notification } from "antd";
import { useEffect, useState, useContext } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchAllUserAPI } from "../../services/api.service";
import { fetchAllProductAPI } from "../../services/api.product";
import { fetchResumeListAPI } from "../../services/api.resume";
import { fetchTransactionListAPI } from "../../services/api.banking";
import { AuthContext } from "../context/auth.context";
import "./home.css";
import { fetchAppUsersAPI } from "../../services/api.appUser";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Hàm tính số tuần trong năm
const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

function Home() {
    const [resumesCount, setResumesCount] = useState(0);
    const [inventory, setInventory] = useState(0);
    const [customers, setCustomers] = useState(0);
    const [totalResumePrice, setTotalResumePrice] = useState(0);
    const [resumeTimePeriod, setResumeTimePeriod] = useState("all"); // Thêm state cho khoảng thời gian
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !user._id) {
            setResumesCount(null);
            setInventory(null);
            setCustomers(null);
            setTotalResumePrice(null);
        } else {
            fetchResumeListAPI(1, 1000).then((res) => {
                const resumeList = res.data?.result || [];
                setResumesCount(res.data?.meta?.total || 0);

                let total = 0;
                const currentDate = new Date(); // Ngày hiện tại: 05/06/2025

                if (resumeTimePeriod === "all") {
                    total = resumeList.reduce((sum, resume) => sum + (resume.totalPrice || 0), 0);
                } else if (resumeTimePeriod === "day") {
                    total = resumeList.reduce((sum, resume) => {
                        const resumeDate = new Date(resume.transactionDate || resume.createdAt || "2025-05-19").toLocaleDateString('vi-VN');
                        if (resumeDate === currentDate.toLocaleDateString('vi-VN')) {
                            return sum + (resume.totalPrice || 0);
                        }
                        return sum;
                    }, 0);
                } else if (resumeTimePeriod === "week") {
                    const currentWeek = getWeekNumber(currentDate);
                    total = resumeList.reduce((sum, resume) => {
                        const resumeWeek = getWeekNumber(resume.transactionDate || resume.createdAt || "2025-05-19");
                        if (resumeWeek === currentWeek) {
                            return sum + (resume.totalPrice || 0);
                        }
                        return sum;
                    }, 0);
                } else if (resumeTimePeriod === "month") {
                    total = resumeList.reduce((sum, resume) => {
                        const resumeDate = new Date(resume.transactionDate || resume.createdAt || "2025-05-19");
                        const resumeMonthYear = `${resumeDate.toLocaleString('vi-VN', { month: 'long' })} ${resumeDate.getFullYear()}`;
                        const currentMonthYear = `${currentDate.toLocaleString('vi-VN', { month: 'long' })} ${currentDate.getFullYear()}`;
                        if (resumeMonthYear === currentMonthYear) {
                            return sum + (resume.totalPrice || 0);
                        }
                        return sum;
                    }, 0);
                } else if (resumeTimePeriod === "year") {
                    total = resumeList.reduce((sum, resume) => {
                        const resumeYear = new Date(resume.transactionDate || resume.createdAt || "2025-05-19").getFullYear();
                        if (resumeYear === currentDate.getFullYear()) {
                            return sum + (resume.totalPrice || 0);
                        }
                        return sum;
                    }, 0);
                }

                setTotalResumePrice(total);
            }).catch((error) => {
                notification.error({
                    message: "Lỗi",
                    description: "Không thể lấy dữ liệu resume. Vui lòng kiểm tra API.",
                });
                setResumesCount(0);
                setTotalResumePrice(0);
            });

            fetchAllProductAPI().then((res) => {
                setInventory(res.data?.meta?.total || 0);
            }).catch((error) => {
                notification.error({
                    message: "Lỗi",
                    description: "Không thể lấy dữ liệu sản phẩm. Vui lòng kiểm tra API.",
                });
                setInventory(0);
            });

            fetchAppUsersAPI().then((res) => {
                setCustomers(res.data?.meta?.total || 0);
            }).catch((error) => {
                notification.error({
                    message: "Lỗi",
                    description: "Không thể lấy dữ liệu khách hàng. Vui lòng kiểm tra API.",
                });
                setCustomers(0);
            });
        }
    }, [user, resumeTimePeriod]);

    return (
        <div className="dashboard-container">
            <Space size={20} direction="vertical" style={{ width: "100%" }}>
                <div className="dashboard-stats">
                    <DashboardCard
                        icon={<ShoppingCartOutlined className="icon orders-icon" />}
                        title={"Resumes"}
                        value={resumesCount}
                    />
                    <DashboardCard
                        icon={<ShoppingOutlined className="icon inventory-icon" />}
                        title={"Products"}
                        value={inventory}
                    />
                    <DashboardCard
                        icon={<UserOutlined className="icon customer-icon" />}
                        title={"Customer"}
                        value={customers}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Select
                            value={resumeTimePeriod}
                            onChange={setResumeTimePeriod}
                            style={{ width: "200px" }}
                        >
                            <Select.Option value="all">Tất cả</Select.Option>
                            <Select.Option value="day">Theo ngày</Select.Option>
                            <Select.Option value="week">Theo tuần</Select.Option>
                            <Select.Option value="month">Theo tháng</Select.Option>
                            <Select.Option value="year">Theo năm</Select.Option>
                        </Select>
                        <DashboardCard
                            icon={<DollarCircleOutlined className="icon revenue-icon" />}
                            title={"Tổng tiền (Resume)"}
                            value={totalResumePrice}
                        />
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="recent-orders">
                        <ExpiringProducts user={user} />
                    </div>
                    <div className="chart">
                        <DashboardChart user={user} />
                    </div>
                </div>
            </Space>
        </div>
    );
}

function DashboardCard({ title, value, icon }) {
    return (
        <Card className="dashboard-card">
            <Space direction="horizontal">
                {icon}
                <Statistic title={title} value={value} />
            </Space>
        </Card>
    );
}

function ExpiringProducts({ user }) {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user._id) {
            setDataSource([]);
        } else {
            setLoading(true);
            fetchAllProductAPI().then((res) => {
                const products = res.data?.result || [];
                const currentDate = new Date();
                const thresholdDate = new Date(currentDate);
                thresholdDate.setDate(currentDate.getDate() + 7);

                const expiringProducts = products
                    .filter((product) => {
                        if (!product.expirationDate) return false;
                        const expirationDate = new Date(product.expirationDate);
                        return expirationDate >= currentDate && expirationDate <= thresholdDate;
                    })
                    .map((product, index) => ({
                        ...product,
                        key: product._id || index,
                        expirationDate: new Date(product.expirationDate).toISOString().split('T')[0],
                    }));

                setDataSource(expiringProducts);
                setLoading(false);
            }).catch((error) => {
                setDataSource([]);
                setLoading(false);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể lấy dữ liệu sản phẩm. Vui lòng kiểm tra API.",
                });
            });
        }
    }, [user]);

    return (
        <>
            <Typography.Title level={5}>Product sắp hết hạn sử dụng</Typography.Title>
            <Table
                columns={[
                    { title: "Name", dataIndex: "name" },
                    { title: "Barcode", dataIndex: "barCode" },
                    { title: "Quantity", dataIndex: "quantity" },
                    { title: "Price", dataIndex: "price" },
                    { title: "Expiration Date", dataIndex: "expirationDate" },
                ]}
                loading={loading}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: "max-content" }}
            />
        </>
    );
}

function DashboardChart({ user }) {
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [timePeriod, setTimePeriod] = useState("day");

    useEffect(() => {
        if (!user || !user._id) {
            setRevenueData({ labels: [], datasets: [] });
        } else {
            const fetchData = async () => {
                try {
                    const [bankingRes, resumeRes] = await Promise.all([
                        fetchTransactionListAPI(),
                        fetchResumeListAPI(1, 1000),
                    ]);

                    const bankingTransactions = bankingRes.data || [];
                    const resumeList = resumeRes.data?.result || [];

                    let bankingLabels = [];
                    let bankingData = [];
                    let resumeLabels = [];
                    let resumeData = [];

                    if (timePeriod === "day") {
                        const bankingDailyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate).toLocaleDateString('vi-VN');
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingDailyData);
                        bankingData = Object.values(bankingDailyData);

                        const resumeDailyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || "2025-05-19").toLocaleDateString('vi-VN');
                            const revenue = curr.totalPrice || 0;
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeDailyData);
                        resumeData = Object.values(resumeDailyData);
                    } else if (timePeriod === "week") {
                        const bankingWeeklyData = bankingTransactions.reduce((acc, curr) => {
                            const week = getWeekNumber(curr.transactionDate);
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[week] = (acc[week] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingWeeklyData);
                        bankingData = Object.values(bankingWeeklyData);

                        const resumeWeeklyData = resumeList.reduce((acc, curr) => {
                            const week = getWeekNumber(curr.transactionDate || curr.createdAt || "2025-05-19");
                            const revenue = curr.totalPrice || 0;
                            acc[week] = (acc[week] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeWeeklyData);
                        resumeData = Object.values(resumeWeeklyData);
                    } else if (timePeriod === "month") {
                        const bankingMonthlyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate);
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingMonthlyData);
                        bankingData = Object.values(bankingMonthlyData);

                        const resumeMonthlyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || "2025-05-19");
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = curr.totalPrice || 0;
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeMonthlyData);
                        resumeData = Object.values(resumeMonthlyData);
                    } else if (timePeriod === "year") {
                        const bankingYearlyData = bankingTransactions.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate).getFullYear();
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingYearlyData).map(year => `${year}`);
                        bankingData = Object.values(bankingYearlyData);

                        const resumeYearlyData = resumeList.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate || curr.createdAt || "2025-05-19").getFullYear();
                            const revenue = curr.totalPrice || 0;
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeYearlyData).map(year => `${year}`);
                        resumeData = Object.values(resumeYearlyData);
                    }

                    const allLabels = [...new Set([...bankingLabels, ...resumeLabels])].sort();

                    setRevenueData({
                        labels: allLabels,
                        datasets: [
                            {
                                label: "Doanh thu (Banking)",
                                data: allLabels.map(label => bankingData[bankingLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(54, 162, 235, 0.8)",
                            },
                            {
                                label: "Doanh thu (Resumes)",
                                data: allLabels.map(label => resumeData[resumeLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(255, 99, 132, 0.8)",
                            },
                        ],
                    });
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể lấy dữ liệu doanh thu. Vui lòng kiểm tra API.",
                    });
                    setRevenueData({ labels: [], datasets: [] });
                }
            };
            fetchData();
        }
    }, [user, timePeriod]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Doanh thu Banking và Resumes theo thời gian" },
        },
    };

    return (
        <Card className="chart-card">
            <div style={{ marginBottom: "16px" }}>
                <Select
                    value={timePeriod}
                    onChange={setTimePeriod}
                    style={{ width: "200px" }}
                >
                    <Select.Option value="day">Theo ngày</Select.Option>
                    <Select.Option value="week">Theo tuần</Select.Option>
                    <Select.Option value="month">Theo tháng</Select.Option>
                    <Select.Option value="year">Theo năm</Select.Option>
                </Select>
            </div>
            <div className="chart-wrapper">
                <Bar options={options} data={revenueData} />
            </div>
        </Card>
    );
}

export default Home;