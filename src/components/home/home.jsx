import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography } from "antd";
import { useEffect, useState } from "react";
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
import { getInventory, getOrders, getRevenue } from "../../assets/API";
import { fetchAllUserAPI } from "../../services/api.service";
import { fetchAllProductAPI } from "../../services/api.product";
import "./home.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Home() {
    const [orders, setOrders] = useState(0);
    const [inventory, setInventory] = useState(0);
    const [customers, setCustomers] = useState(0);
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        getOrders().then((res) => {
            setOrders(res.total);
            setRevenue(res.discountedTotal);
        });
        getInventory().then((res) => {
            setInventory(res.total);
        });
        fetchAllUserAPI().then((res) => {
            setCustomers(res.data.meta.total);
        });
    }, []);

    return (
        <div className="dashboard-container">
            <Space size={20} direction="vertical" style={{ width: "100%" }}>
                <div className="dashboard-stats">
                    <DashboardCard
                        icon={<ShoppingCartOutlined className="icon orders-icon" />}
                        title={"Orders"}
                        value={orders}
                    />
                    <DashboardCard
                        icon={<ShoppingOutlined className="icon inventory-icon" />}
                        title={"Inventory"}
                        value={inventory}
                    />
                    <DashboardCard
                        icon={<UserOutlined className="icon customer-icon" />}
                        title={"Customer"}
                        value={customers}
                    />
                    <DashboardCard
                        icon={<DollarCircleOutlined className="icon revenue-icon" />}
                        title={"Revenue"}
                        value={revenue}
                    />
                </div>

                <div className="dashboard-content">
                    <div className="recent-orders">
                        <RecentOrders />
                    </div>
                    <div className="chart">
                        <DashboardChart />
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

function RecentOrders() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchAllProductAPI().then((res) => {
            // Assuming the response contains a list of Products with unique ids
            const recentOrders = res.data.result.slice(6, 9); // Get a subset of data
            // Add a unique `key` to each row
            const dataWithKey = recentOrders.map((order, index) => ({
                ...order,
                key: order.id || index, // Ensure you have a unique key (use `order.id` if available)
            }));
            setDataSource(dataWithKey);
            setLoading(false);
        });
    }, []);

    return (
        <>
            <Typography.Title level={5}>Recent Orders</Typography.Title>
            <Table
                columns={[
                    { title: "Title", dataIndex: "mainText" },
                    { title: "Quantity", dataIndex: "quantity" },
                    { title: "Price", dataIndex: "price" },
                ]}
                loading={loading}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: "max-content" }}
            />
        </>
    );
}

function DashboardChart() {
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        getRevenue().then((res) => {
            const labels = res.carts.map((cart) => `User-${cart.userId}`);
            const data = res.carts.map((cart) => cart.discountedTotal);

            setRevenueData({
                labels,
                datasets: [
                    {
                        label: "Revenue",
                        data,
                        backgroundColor: "rgba(255, 0, 0, 0.8)",
                    },
                ],
            });
        });
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Order Revenue" },
        },
    };

    return (
        <Card className="chart-card">
            <div className="chart-wrapper">
                <Bar options={options} data={revenueData} />
            </div>
        </Card>
    );
}

export default Home;
