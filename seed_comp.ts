import prisma from "./src/lib/prisma";

const mockDictionary = [
  {
    code: "C01",
    name: "Safety Awareness",
    definition: "Mampu memahami dan mengaplikasikan standar keselamatan dan kesehatan kerja (K3) di lingkungan operasional bandara.",
    category: "Functional",
    level: "Level 1 (Knowledgeable)",
  },
  {
    code: "C03",
    name: "Aircraft Ground Handling",
    definition: "Mampu melakukan prosedur penanganan pesawat di darat sesuai dengan standar keselamatan internasional dan regulasi penerbangan sipil.",
    category: "Functional",
    level: "Level 3 (Analyze)",
  },
  {
    code: "C08",
    name: "Communication",
    definition: "Mampu menyampaikan informasi secara jelas, efektif, dan profesional kepada rekan kerja, atasan, maupun pelanggan.",
    category: "Core",
    level: "Level 2 (Apply)",
  },
  {
    code: "L01",
    name: "Team Leadership",
    definition: "Mampu memimpin tim, memberikan arahan, serta memotivasi anggota tim untuk mencapai target operasional.",
    category: "Leadership",
    level: "Level 4 (Evaluate)",
  }
];

async function seed() {
    try {
        for (const comp of mockDictionary) {
            await prisma.competency.create({ data: comp });
            console.log("Created", comp.code);
        }
        console.log("Seeded successfully");
    } catch (err) {
        console.error("Error seeding:", err);
    }
}
seed();
