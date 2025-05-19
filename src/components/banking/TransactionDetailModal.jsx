// src/components/banking/TransactionDetailModal.jsx
import React from "react";
import { Modal, Button } from "antd";

const TransactionDetailModal = ({
    detailVisible,
    setDetailVisible,
    selectedTransaction,
    formatAmount,
}) => {
    return (
        <Modal
            title="Chi Tiết Giao Dịch"
            open={detailVisible}
            onCancel={() => setDetailVisible(false)}
            footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                    Đóng
                </Button>,
            ]}
        >
            {selectedTransaction ? (
                <div>
                    <p>
                        <strong>ID Giao Dịch:</strong> {selectedTransaction.id || "N/A"}
                    </p>
                    <p>
                        <strong>Ngày Giao Dịch:</strong>{" "}
                        {selectedTransaction.transactionDate
                            ? new Date(selectedTransaction.transactionDate).toLocaleString("vi-VN")
                            : "N/A"}
                    </p>
                    <p>
                        <strong>Số Tiền:</strong>{" "}
                        {(() => {
                            const { text, className } = formatAmount(
                                selectedTransaction.amountIn,
                                selectedTransaction.amountOut
                            );
                            return <span className={className}>{text}</span>;
                        })()}
                    </p>
                    <p>
                        <strong>Loại Tiền:</strong>{" "}
                        {selectedTransaction.amountIn > 0 ? "Chuyển vào" : "Chuyển ra"}
                    </p>
                    <p>
                        <strong>Nội Dung:</strong> {selectedTransaction.content || "N/A"}
                    </p>
                </div>
            ) : (
                <p>Đang tải...</p>
            )}
        </Modal>
    );
};

export default TransactionDetailModal;