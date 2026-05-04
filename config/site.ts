export type SiteConfig = {
    name: string;
    contact: {
      wa: { raw: string; display: string };
      phone: { raw: string; display: string };
      email: string;
      address: string[];
      mapsLink: string;
      mapsEmbed: string;
    };
  };
  
  export const siteConfig: SiteConfig = {
    name: "Klinik Pratama Cipatik",
    contact: {
      wa: { raw: "628999801472", display: "0899-9801-472" },
      phone: { raw: "08999801472", display: "0899-9801-472" }, // Format E.164 (+62...)
      email: "halo@klinikcipatik.com",
      address: [
        "Jl. Raya Cipatik, Kec. Cihampelas",
        "Kabupaten Bandung Barat",
        "Jawa Barat, Indonesia"
      ],
      mapsLink: "https://www.google.com/maps?q=Klinik+Pratama+Cipatik,+Kabupaten+Bandung+Barat", 
      mapsEmbed: "https://maps.google.com/maps?q=Klinik+Pratama+Cipatik,+Kabupaten+Bandung+Barat&t=&z=13&ie=UTF8&iwloc=&output=embed" 
    }
  };