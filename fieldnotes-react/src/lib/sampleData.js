export const SAMPLE_LABEL = "Exploring Europa";

export const sampleDocument = `Europa is one of Jupiter's four large Galilean moons.
It orbits Jupiter once every 3.55 Earth days at an average distance of 670,900 kilometers.
Its surface is made primarily of water ice and is among the smoothest in the Solar System.
The ice shell is estimated to be 15 to 25 kilometers thick.
Scientists estimate a global ocean lies beneath the ice shell and may contain more than twice as much water as Earth's oceans.
Europa's induced magnetic field, measured by the Galileo spacecraft, provides strong evidence for a salty subsurface ocean.
Long, dark fractures called lineae crisscross the surface and contain few impact craters, suggesting the surface is geologically young.
The Hubble Space Telescope observed water vapor plumes above Europa's south polar region in 2012.
NASA's Europa Clipper mission launched on October 14, 2024, and is scheduled to arrive at Jupiter in 2030.
The mission will make 49 close flybys of Europa to investigate its habitability.`;

export const benchmarkCases = [
  { question: "What is Europa?", expected: 0 },
  { question: "How thick is the ice shell?", expected: 3 },
  { question: "What provides evidence for the salty ocean?", expected: 5 },
  { question: "When was Europa Clipper launched?", expected: 8 },
  { question: "How many close flybys will the mission make?", expected: 9 },
  { question: "What did Hubble observe above Europa?", expected: 7 }
];

export const suggestions = [
  "What is Europa?",
  "What evidence of water is mentioned?",
  "How thick is the ice shell?"
];
