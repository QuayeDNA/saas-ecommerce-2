export const CONTACTS = {
  support: {
    phone: "+233542405901",
    waLink: "https://wa.me/233542405901",
    waLinkWithMsg: (msg: string) =>
      `https://wa.me/233542405901?text=${encodeURIComponent(msg)}`,
  },
  community: {
    waGroupLink: "https://chat.whatsapp.com/CO5w8bisGsJ3yTA7EkXBBX",
  },
} as const;
