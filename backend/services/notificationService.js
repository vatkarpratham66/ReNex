const NGO = require("../models/NGO");
const { sendMail } = require("../utils/mailer");

const appUrl = process.env.APP_BASE_URL || "http://localhost:5173";

const sendSafely = async (promiseFactory, context) => {
  try {
    return await promiseFactory();
  } catch (error) {
    console.error(`Notification failed (${context}):`, error.message);
    return null;
  }
};

const toCategoryArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return [String(value).trim()].filter(Boolean);
};

const donationSummary = (donation) => [
  `Title: ${donation.title}`,
  `Category: ${donation.category}`,
  `Quantity: ${donation.quantity}`,
  `Pickup location: ${donation.pickup_location}`,
  donation.pickup_by ? `Pickup by: ${new Date(donation.pickup_by).toLocaleDateString()}` : null,
].filter(Boolean);

const sendDonationCreatedToDonor = async ({ donorUser, donation }) =>
  sendSafely(
    () =>
      sendMail({
        to: donorUser.email,
        subject: "Needo: Your donation is now live",
        text: [
          `Hi ${donorUser.name},`,
          "",
          "Your donation has been created successfully.",
          ...donationSummary(donation),
          "",
          `You can review it in your dashboard: ${appUrl}/donor/my`,
        ].join("\n"),
        html: `
          <p>Hi ${donorUser.name},</p>
          <p>Your donation has been created successfully.</p>
          <ul>${donationSummary(donation).map((line) => `<li>${line}</li>`).join("")}</ul>
          <p><a href="${appUrl}/donor/my">View My Donations</a></p>
        `,
      }),
    "donation_created_donor"
  );

const sendDonationCreatedToMatchingNgos = async ({ donorUser, donation }) =>
  sendSafely(async () => {
    const donationCategories = toCategoryArray(donation.category).map((item) => item.toLowerCase());
    const ngos = await NGO.find({ verified: true }).populate("user_id", "name email");

    const recipients = ngos.filter((ngo) => {
      const user = ngo.user_id;
      if (!user?.email) return false;

      const needs = toCategoryArray(ngo.needs_category).map((item) => item.toLowerCase());
      return needs.length === 0 || donationCategories.some((category) => needs.includes(category));
    });

    await Promise.all(
      recipients.map((ngo) =>
        sendMail({
          to: ngo.user_id.email,
          subject: `Needo: New ${donation.category} donation available`,
          text: [
            `Hi ${ngo.user_id.name || ngo.ngo_name},`,
            "",
            "A new donation matching your organization has been posted.",
            ...donationSummary(donation),
            `Posted by: ${donorUser.name}`,
            "",
            `Browse donations: ${appUrl}/ngo/browse`,
          ].join("\n"),
          html: `
            <p>Hi ${ngo.user_id.name || ngo.ngo_name},</p>
            <p>A new donation matching your organization has been posted.</p>
            <ul>${donationSummary(donation).map((line) => `<li>${line}</li>`).join("")}</ul>
            <p>Posted by: ${donorUser.name}</p>
            <p><a href="${appUrl}/ngo/browse">Browse Donations</a></p>
          `,
        })
      )
    );
  }, "donation_created_ngos");

const sendDonationAccepted = async ({ donorUser, donation, ngo, ngoUser }) =>
  sendSafely(
    () =>
      sendMail({
        to: donorUser.email,
        subject: "Needo: Your donation was accepted",
        text: [
          `Hi ${donorUser.name},`,
          "",
          `${ngo.ngo_name} has accepted your donation "${donation.title}".`,
          `NGO contact: ${ngoUser.name} (${ngoUser.email}${ngoUser.phone ? `, ${ngoUser.phone}` : ""})`,
          "",
          `Track it here: ${appUrl}/donor/my`,
        ].join("\n"),
        html: `
          <p>Hi ${donorUser.name},</p>
          <p><strong>${ngo.ngo_name}</strong> has accepted your donation "<strong>${donation.title}</strong>".</p>
          <p>NGO contact: ${ngoUser.name} (${ngoUser.email}${ngoUser.phone ? `, ${ngoUser.phone}` : ""})</p>
          <p><a href="${appUrl}/donor/my">Track Donation</a></p>
        `,
      }),
    "donation_accepted"
  );

const sendDonationStatusUpdate = async ({ donorUser, donation, ngo, status }) =>
  sendSafely(
    () =>
      sendMail({
        to: donorUser.email,
        subject: `Needo: Donation status updated to ${status.replaceAll("_", " ")}`,
        text: [
          `Hi ${donorUser.name},`,
          "",
          `Your donation "${donation.title}" with ${ngo.ngo_name} is now ${status.replaceAll("_", " ")}.`,
          "",
          `Open dashboard: ${appUrl}/donor/my`,
        ].join("\n"),
        html: `
          <p>Hi ${donorUser.name},</p>
          <p>Your donation "<strong>${donation.title}</strong>" with <strong>${ngo.ngo_name}</strong> is now <strong>${status.replaceAll("_", " ")}</strong>.</p>
          <p><a href="${appUrl}/donor/my">Open Dashboard</a></p>
        `,
      }),
    "donation_status"
  );

const sendNgoVerificationResult = async ({ ngo, ngoUser, approved }) =>
  sendSafely(
    () =>
      sendMail({
        to: ngoUser.email,
        subject: approved
          ? "Needo: Your NGO has been verified"
          : "Needo: Your NGO verification was rejected",
        text: [
          `Hi ${ngoUser.name},`,
          "",
          approved
            ? `${ngo.ngo_name} has been verified. You can now accept donations on Needo.`
            : `${ngo.ngo_name} was marked as rejected. Please review your profile and certificate details.`,
          "",
          `Open your profile: ${appUrl}/profile/ngo`,
        ].join("\n"),
        html: `
          <p>Hi ${ngoUser.name},</p>
          <p>${
            approved
              ? `<strong>${ngo.ngo_name}</strong> has been verified. You can now accept donations on Needo.`
              : `<strong>${ngo.ngo_name}</strong> was marked as rejected. Please review your profile and certificate details.`
          }</p>
          <p><a href="${appUrl}/profile/ngo">Open NGO Profile</a></p>
        `,
      }),
    approved ? "ngo_verified" : "ngo_rejected"
  );

const sendUserBlockedStatus = async ({ user, blocked }) =>
  sendSafely(
    () =>
      sendMail({
        to: user.email,
        subject: blocked
          ? "Needo: Your account has been blocked"
          : "Needo: Your account has been reactivated",
        text: [
          `Hi ${user.name},`,
          "",
          blocked
            ? "Your Needo account has been blocked by an administrator. If this seems incorrect, please contact support."
            : "Your Needo account has been reactivated. You can log in again.",
          "",
          `App: ${appUrl}/login`,
        ].join("\n"),
        html: `
          <p>Hi ${user.name},</p>
          <p>${
            blocked
              ? "Your Needo account has been blocked by an administrator. If this seems incorrect, please contact support."
              : "Your Needo account has been reactivated. You can log in again."
          }</p>
          <p><a href="${appUrl}/login">Open Needo</a></p>
        `,
      }),
    blocked ? "user_blocked" : "user_unblocked"
  );

module.exports = {
  sendDonationCreatedToDonor,
  sendDonationCreatedToMatchingNgos,
  sendDonationAccepted,
  sendDonationStatusUpdate,
  sendNgoVerificationResult,
  sendUserBlockedStatus,
};
