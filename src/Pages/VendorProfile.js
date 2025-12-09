import { useParams } from "react-router-dom";
import {
  Container,
  Table,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";

// Dummy vendor data
const dummyVendors = [
  {
    id: 1,
    name: "Vendor One",
    email: "vendor1@example.com",
    phone: "1234567890",
    company: "Company A",
    address: "123 Street, City",
    since: "2022-06-15",
    profileImage: "https://th.bing.com/th/id/R.e2bb45fff1e398723c711c519502d5a3?rik=SEPvooeqfgw0kA&riu=http%3a%2f%2fimages.unsplash.com%2fphoto-1535713875002-d1d0cf377fde%3fcrop%3dentropy%26cs%3dtinysrgb%26fit%3dmax%26fm%3djpg%26ixid%3dMnwxMjA3fDB8MXxzZWFyY2h8NHx8bWFsZSUyMHByb2ZpbGV8fDB8fHx8MTYyNTY2NzI4OQ%26ixlib%3drb-1.2.1%26q%3d80%26w%3d1080&ehk=Gww3MHYoEwaudln4mR6ssDjrAMbAvyoXYMsyKg5p0Ac%3d&risl=&pid=ImgRaw&r=0",
    location: "Mumbai",
    coupons: [
      {
        code: "VENDOR10",
        discount: "10%",
        reward: "₹100 cashback",
        status: "Active",
        issuedOn: "2024-12-01",
      },
    ],
    transactions: [
      {
        txnId: "TXN1001",
        amount: "₹5000",
        date: "2025-04-20",
        status: "Success",
      },
    ],
    storeStats: {
      totalOrders: 300,
      revenue: "₹2,00,000",
      rating: 4.5,
    },
    feedbacks: [
      {
        by: "Customer A",
        message: "Great service!",
        date: "2025-05-01",
      },
    ],
    logs: [
      {
        event: "Coupon Issued",
        detail: "Issued coupon VENDOR10",
        date: "2025-04-01",
      },
    ],
  },
];

export default function VendorProfile() {
  const { id } = useParams();
  const vendor = dummyVendors.find((v) => v.id === parseInt(id));

  if (!vendor) return <Container className="mt-4">Vendor not found</Container>;

  return (
    <Container className="my-5">
      <Card>
        <CardBody>
          {/* Profile Section */}
          <Row className="mb-4">
            <Col md="4" className="text-center">
              <img
                src={vendor.profileImage}
                alt="Profile"
                className="img-thumbnail rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </Col>
            <Col md="8">
              <CardTitle tag="h4" className="mb-4">
                Vendor Details
              </CardTitle>
              <Table bordered responsive>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{vendor.name}</td>
                    <th>Email</th>
                    <td>{vendor.email}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>{vendor.phone}</td>
                    <th>Company</th>
                    <td>{vendor.company}</td>
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>{vendor.address}</td>
                    <th>Location</th>
                    <td>{vendor.location}</td>
                  </tr>
                  <tr>
                    <th>Vendor Since</th>
                    <td>{vendor.since}</td>
                    <th>Status</th>
                    <td>Active</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* Store Stats */}
          <CardTitle tag="h5" className="mt-5 mb-3">Store Stats</CardTitle>
          <Table bordered responsive>
            <tbody>
              <tr>
                <th>Total Orders</th>
                <td>{vendor.storeStats.totalOrders}</td>
                <th>Total Revenue</th>
                <td>{vendor.storeStats.revenue}</td>
              </tr>
              <tr>
                <th>Store Rating</th>
                <td colSpan="3">{vendor.storeStats.rating} ⭐</td>
              </tr>
            </tbody>
          </Table>

          {/* Coupon Details */}
          <CardTitle tag="h5" className="mt-5 mb-3">Issued Coupons</CardTitle>
          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Issued On</th>
              </tr>
            </thead>
            <tbody>
              {vendor.coupons.map((coupon, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{coupon.code}</td>
                  <td>{coupon.discount}</td>
                  <td>{coupon.reward}</td>
                  <td>{coupon.status}</td>
                  <td>{coupon.issuedOn}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Transaction History */}
          <CardTitle tag="h5" className="mt-5 mb-3">Transaction History</CardTitle>
          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendor.transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{txn.txnId}</td>
                  <td>{txn.amount}</td>
                  <td>{txn.date}</td>
                  <td>{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Logs */}
          <CardTitle tag="h5" className="mt-5 mb-3">Event Logs</CardTitle>
          <Table bordered responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {vendor.logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{log.event}</td>
                  <td>{log.detail}</td>
                  <td>{log.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Feedbacks */}
          <CardTitle tag="h5" className="mt-5 mb-3">Customer Feedback</CardTitle>
          <Table bordered responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>By</th>
                <th>Feedback</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {vendor.feedbacks.map((fb, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{fb.by}</td>
                  <td>{fb.message}</td>
                  <td>{fb.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
}
