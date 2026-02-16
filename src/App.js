import React from "react";
import { Route, Routes } from "react-router-dom";

// Import your components
import DepartmentList from "./Components/department";
import SubDepartmentList from "./Components/subdepartment.js";
import AdminLayout from "./Layout/AdminLayout.jsx";
import AttendanceForm from "./Pages/AttendanceForm.js";
import Dashboard from "./Pages/Dashboard.jsx";
import Holiday from "./Pages/Holiday.js";
import DiagnostiCreate from "./Pages/LeaveApplication.js";
import LeaveApproval from "./Pages/LeaveApproval";
import Leaves from "./Pages/Leaves.js";
import MissingAttendance from "./Pages/MissingAttendance.js";
import MonthlyAttendance from "./Pages/MonthlyAttendance.js";
import WeeklyHoliday from "./Pages/WeeklyHoliday.js";
import Recruitment from "./Components/recruitment.js";
import DiagnosticList from "./Pages/Awardlist.js";
import BackupReset from "./Pages/BackupReset.js";
import LanguageSetup from "./Pages/LanguageSetup.js";
import MessagesTable from "./Pages/Message.js";
import NoticeList from "./Pages/Noticelist.js";
import SentMessagesTable from "./Pages/Sent.js";
import Settings from "./Pages/Setting";
import SetupRulesTable from "./Pages/Setup.js";
import CandidateShortlist from "./Pages/CandidateShortlist.js";
import InterviewList from "./Pages/InterviewList.js";
import CandidateSelection from "./Pages/CandidateSelection.js";
import ClientsTable from "./Pages/ClientsTable.js";
import ProjectsTable from "./Pages/ProjectsTable.js";
import ProjectTasksTable from "./Pages/ProjectTasksTable.js";
import ManageProjects from "./Pages/ManageProject.js";
import CompanyDetailsForm from "./Pages/CompanyDetailsForm.js";
import CompanyList from "./Pages/CompanyList.js";
import DoctorDetailsForm from "./Pages/DoctorDetailsForm.js";
import DoctorList from "./Pages/DoctorList.js";
import StaffDetailsForm from "./Pages/StaffDetailsForm.js";
import StaffList from "./Pages/StaffList.js";
import DiagnosticsBookingList from "./Pages/DiagnosticsBookingList.js";
import DoctorAppointmentList from "./Pages/DoctorAppointmentList.js";
import AppointmentBookingForm from "./Pages/AppointmentBookingForm.js";
import DiagnosticDetail from "./Pages/DiagnosticDetail.js";
import DiagnosticsPendingBooking from "./Pages/DiagnosticsPendingBooking.js";
import DoctorAppointmentListPending from "./Pages/DoctorAppointmentListPending.js";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import CompanySidebar from "./Components/CompanySidebar.js";
import DiagnosticsAcceptedBooking from "./Pages/DiagnosticsAcceptedBooking.js";
import DiagnosticsRejectedBooking from "./Pages/DiagnosticsRejectedBooking.js";
import AcceptedAppointmentsList from "./Pages/AcceptedAppointmentsList.js";
import RejectedAppointmentsList from "./Pages/RejectedAppointmentsList.js";
import StaffHistory from "./Pages/StaffHistory.js";
import DiagnosticBookingForm from "./Pages/DiagnosticBookingForm.js";
import CouponsPage from "./Pages/CouponPage.js";
import CreateCoupon from "./Pages/CreateCoupon.js";
import UploadDocuments from "./Pages/UploadDocuments.js";
import DocumentTable from "./Pages/DocumentTable.js";
import CouponHistoryTable from "./Pages/CouponHistoryTable.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import ProductList from "./Pages/ProductList.js";
import BookingList from "./Pages/BookingList.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import CompletedBookingList from "./Pages/CompletedBookingList .js";
import CancelledBookingList from "./Pages/CancelledBookingList .js";
import UserList from "./Pages/UserList.js";
import CreatePoster from "./Pages/CreatePoster.js";
import CreateCategory from "./Pages/CreateCategory.js";
import PosterList from "./Pages/PosterList.js";
import CreateLogo from "./Pages/CreateLogo.js";
import LogoList from "./Pages/LogoList.js";
import CreateBusinessCard from "./Pages/CreateBusinessCard.js";
import CreatePlan from "./Pages/CreatePlan.js";
import PlanList from "./Pages/PlanList.js";
import UsersPlansList from "./Pages/UsersPlansList.js";
import PrivacyPolicyForm from "./Pages/PrivacyPolicyForm.js";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage.js";
import AboutUsFormPage from "./Pages/AboutUsFormPage.js";
import GetAboutUsPage from "./Pages/GetAboutUsPage.js";
import ContactUsPage from "./Pages/ContactUsPage.js";
import GetContactUsPage from "./Pages/GetContactUsPage.js";
import CreateVendor from "./Pages/CreateVendor.js";
import VendorList from "./Pages/VendorList.js";
import RedeemedCouponsList from "./Pages/RedeemedCouponsList.js";
import VendorDocumentList from "./Pages/VendorDocumentList.js";
import VendorInvoiceList from "./Pages/VendorInvoiceList.js";
import ReceivedPayments from "./Pages/ReceivedPayments.js";
import AllPayments from "./Pages/AllPayments.js";
import UserProfile from "./Pages/UserProfile.js";
import VendorProfile from "./Pages/VendorProfile.js";
import AllUserCoupons from "./Pages/userCoupons.js";
import Category from "./Pages/CreateCategory.js";
import CreatePharmacy from "./Pages/CreatePharmacy.js";
import PharmacyList from "./Pages/PharmacyList.js";
import CreateMedicine from "./Pages/CreateMedicine.js";
import MedicineList from "./Pages/MedicineList.js";
import SingleMedicine from "./Pages/MedicineDetails.js";
import AllOrders from "./Pages/AllOrders.js";
import SingleOrder from "./Pages/SingleOrder.js";
import UserDetails from "./Pages/UserProfile.js";
import PharmacyDetails from "./Pages/PharmacyDetails.js";
import CreateRider from "./Pages/CreateRider.js";
import RiderList from "./Pages/RiderList.js";
import DeliveredOrders from "./Pages/DeliveredOrders.js";
import QueriesPage from "./Pages/QueriesPage.js";
import RefundOrders from "./Pages/RefundOrders.js";
import CreateAds from "./Pages/CreateAds.js";
import AdsList from "./Pages/AdsList.js";
import PrescriptionsPage from "./Pages/PrescriptionsPage.js";
import NotificationPage from "./Pages/NotificationPage.js";
import BannerManager from "./Pages/BannerManager.js";
import WithdrawalRequestsPage from "./Pages/WithdrawalRequestsPage.js";
import MessagesPage from "./Pages/MessagePage.js";
import RiderQueriesPage from "./Pages/RiderQueriesPage.js";
import PeriodicOrders from "./Pages/PeriodicOrders.js";
import FAQForm from "./Pages/FAQForm.js";
import ActivePharmacyList from "./Pages/ActivePharmacyList.js";
import TodaysOrders from "./Pages/TodaysOrders.js";
import CancelledOrders from "./Pages/CancelledOrders.js";
import OnlineRiders from "./Pages/OnlineRiders.js";
import AddCoupon from "./Pages/AddCoupon.js";
import GetCoupons from "./Pages/GetCoupons.js";
import PrescriptionOrders from "./Pages/PrescriptionOrders.js";
import VendorQueriesPage from "./Pages/VendorQueriesPage.js";
import VendorPaymentHistory from "./Pages/VendorPaymentHistory.js";
import InactivePharmacyList from "./Pages/InactivePharmacyList.js";
import AdminWithdrawalManagement from "./Pages/VendorWidhwarallist.js";




function App() {
  return (
    <Routes>
      {/* Login page rendered outside AdminLayout */}
      <Route path="/" element={<LoginPage />} />

      {/* All other routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/department" element={<DepartmentList />} />
              <Route path="/subdepartment" element={<SubDepartmentList />} />
              <Route path="/attendanceform" element={<AttendanceForm />} />
              <Route path="/monthlyattendance" element={<MonthlyAttendance />} />
              <Route path="/missingattendance" element={<MissingAttendance />} />
              <Route path="/weeklyholiday" element={<WeeklyHoliday />} />
              <Route path="/holiday" element={<Holiday />} />
              <Route path="/create-diagnostic" element={<DiagnostiCreate />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leaveapproval" element={<LeaveApproval />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/setting" element={<Settings />} />
              <Route path="/languagesetup" element={<LanguageSetup />} />
              <Route path="/backupreset" element={<BackupReset />} />
              <Route path="/diagnosticlist" element={<DiagnosticList />} />
              <Route path="/message" element={<MessagesTable />} />
              <Route path="/noticelist" element={<NoticeList />} />
              <Route path="/sentlist" element={<SentMessagesTable />} />
              <Route path="/setuplist" element={<SetupRulesTable />} />
              <Route path="/candidate-shortlist" element={<CandidateShortlist />} />
              <Route path="/interviewlist" element={<InterviewList />} />
              <Route path="/selectedcandidates" element={<CandidateSelection />} />
              <Route path="/clients" element={<ClientsTable />} />
              <Route path="/projects" element={<ProjectsTable />} />
              <Route path="/task" element={<ProjectTasksTable />} />
              <Route path="/manage-project" element={<ManageProjects />} />
              <Route path="/company-register" element={<CompanyDetailsForm />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/create-doctor" element={<DoctorDetailsForm />} />
              <Route path="/doctorlist" element={<DoctorList />} />
              <Route path="/staff-register" element={<StaffDetailsForm />} />
              <Route path="/stafflist" element={<StaffList />} />
              <Route path="/diagnosticslist" element={<DiagnosticsBookingList />} />
              <Route path="/diagnosticsacceptedlist" element={<DiagnosticsAcceptedBooking />} />
              <Route path="/diagnosticsrejectedlist" element={<DiagnosticsRejectedBooking />} />
              <Route path="/doctoracceptedlist" element={<AcceptedAppointmentsList />} />
              <Route path="/doctorrejectedlist" element={<RejectedAppointmentsList />} />
              <Route path="/appintmentlist" element={<DoctorAppointmentList />} />
              <Route path="/appintmentbooking" element={<AppointmentBookingForm />} />
              <Route path="/diagnostic-center/:id" element={<DiagnosticDetail />} />
              <Route path="/diagnosticpending" element={<DiagnosticsPendingBooking />} />
              <Route path="/doctorpendingbookings" element={<DoctorAppointmentListPending />} />
              <Route path="/categoryform" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/add-product" element={<CreateProductForm />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/allorders" element={<BookingList />} />
              <Route path="/pendingorders" element={<PendingBookingList />} />
              <Route path="/completedorders" element={<CompletedBookingList />} />
              <Route path="/companysidebar" element={<CompanySidebar />} />
              <Route path="/staff-history/:staffId" element={<StaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="/book-diagnostic" element={<DiagnosticBookingForm />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/couponshistory" element={<CouponHistoryTable />} />
              <Route path="/create-coupon" element={<CreateCoupon />} />
              <Route path="/upload-docs" element={<UploadDocuments />} />
              <Route path="/docs" element={<DocumentTable />} />
              <Route path="/user-coupons" element={<AllUserCoupons />} />

              <Route path="/users" element={<UserList />} />
              <Route path="/users/:userId" element={<UserDetails />} />
              <Route path="/create-category" element={<CreateCategory />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/create-poster" element={<CreatePoster />} />
              <Route path="/posterlist" element={<PosterList />} />
              <Route path="/create-logo" element={<CreateLogo />} />
              <Route path="/logolist" element={<LogoList />} />
              <Route path="/create-businesscard" element={<CreateBusinessCard />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/planlist" element={<PlanList />} />
              <Route path="/userplanlist" element={<UsersPlansList />} />
              <Route path="/create-privacy" element={<PrivacyPolicyForm />} />
              <Route path="/get-policy" element={<PrivacyPolicyPage />} />
              <Route path="/aboutus" element={<AboutUsFormPage />} />
              <Route path="/getaboutus" element={<GetAboutUsPage />} />
              <Route path="/contactus" element={<ContactUsPage />} />
              <Route path="/getcontactus" element={<GetContactUsPage />} />
              <Route path="/create-vendor" element={<CreateVendor />} />
              <Route path="/vendorlist" element={<VendorList />} />
              <Route path="/vendordocumentlist" element={<VendorDocumentList />} />
              <Route path="/redeemed-coupons" element={<RedeemedCouponsList />} />
              <Route path="/payment" element={<VendorInvoiceList />} />
              <Route path="/rcvdpayment" element={< ReceivedPayments />} />
              <Route path="/allpayments" element={< AllPayments />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/vendor/:id" element={<VendorProfile />} />
              <Route path="/category" element={<Category />} />
              <Route path="/create-pharmacy" element={<CreatePharmacy />} />
              <Route path="/pharmacylist" element={<PharmacyList />} />
              <Route path="/pharmacy/:pharmacyId" element={<PharmacyDetails />} />
              <Route path="/add-medicine" element={<CreateMedicine />} />
              <Route path="/medicinelist" element={<MedicineList />} />
              <Route path="/medicine/:medicineId" element={<SingleMedicine />} />
              <Route path="/orderlist" element={<AllOrders />} />
              <Route path="/admin/orders/:orderId" element={<SingleOrder />} />
              <Route path="/add-rider" element={<CreateRider />} />
              <Route path="/riderlist" element={<RiderList />} />
              <Route path="/alldeliveredorders" element={<DeliveredOrders />} />
              <Route path="/queries" element={<QueriesPage />} />
              <Route path="/allrefundedorders" element={<RefundOrders />} />
              <Route path="/create-ads" element={<CreateAds />} />
              <Route path="/adslist" element={<AdsList />} />
              <Route path="/prescriptions" element={<PrescriptionsPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/banners" element={<BannerManager />} />
              <Route path="/riderpayments" element={<WithdrawalRequestsPage />} />
              <Route path="/allmessage" element={<MessagesPage />} />
              <Route path="/rdierqueries" element={<RiderQueriesPage />} />
              <Route path="/preodicorders" element={<PeriodicOrders />} />
              <Route path="/faq" element={<FAQForm />} />
              <Route path="/activepharmacies" element={<ActivePharmacyList />} />
              <Route path="/inactivepharmacies" element={<InactivePharmacyList />} />
              <Route path="/todaysorders" element={<TodaysOrders />} />
              <Route path="/cancelledorders" element={<CancelledOrders />} />
              <Route path="/onlineriders" element={<OnlineRiders />} />
              <Route path="/add-coupon" element={<AddCoupon />} />
              <Route path="/couponlist" element={<GetCoupons />} />
              <Route path="/prescriptionorders" element={<PrescriptionOrders />} />
              <Route path="/vendorqueries" element={<VendorQueriesPage />} />
              <Route path="/vendorpaymenthistory" element={<VendorPaymentHistory />} />
              <Route path="/vendorwithdrawal" element={<AdminWithdrawalManagement />} />








            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
