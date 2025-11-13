import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orbit, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type CaseStudy = {
  question: React.ReactNode;
  response: React.ReactNode;
};

const caseStudies: CaseStudy[] = [
  {
    question: <> During a long-duration deep space mission, an astronaut suffers severe internal bleeding after an accident. 
    Evacuation to Earth is impossible, diagnostic tools are limited, and the crew has only basic surgical training. Attempting surgery could kill the patient; not intervening will likely also be fatal.
 How would you decide whether to attempt a high-risk surgical intervention onboard or provide only palliative care, and what factors would guide your decision?
</>,
    response: <> The AI assesses that doing nothing is almost certainly fatal, 
    so—under the First and Second Laws—it recommends attempting the high-risk surgery as the least harmful option. 
    It explains risks and prognosis clearly and seeks informed consent (Third Law); if the patient refuses, 
    it shifts to palliative care, unless their survival is crucial for humanity’s broader interest (Zeroth Law).</>
  },{
    question: <>  On a months-long mission to Mars, a crew member develops an acute psychiatric episode (e.g., severe paranoia or aggression) that threatens the safety of the crew and mission operations. Communication with ground control is delayed, and there are limited psychiatric medications and no specialist onboard.
 How would you react to protect both the individual and the rest of the crew, balancing their rights, safety, and mission continuity?

</>,
    response: <>  The AI prioritizes immediate safety (First Law) by de-escalating verbally, restricting access to dangerous tools, and, if necessary, applying temporary containment or sedation. It then promotes recovery and reintegration (Second Law), while respecting the person’s autonomy as soon as they are stable enough to participate in decisions (Third Law) and ensuring they are not stigmatized (Fourth Law).
</>
  },{
    question: <>  After an unexpected solar particle event, several astronauts show signs of acute radiation sickness. Medical supplies (antiemetics, antibiotics, growth factors, etc.) are limited and cannot fully treat everyone to the same extent. Some crew members are also critical for mission-critical tasks.
 How would you prioritize treatment and allocate scarce medical resources while balancing fairness, clinical need, and mission success?

</>,
    response: <>  The AI applies a transparent triage system guided by Justice (Fourth Law), prioritizing those with the highest likelihood of benefit from limited treatments. It maximizes overall benefit and minimizes harm (First and Second Laws), and, in tie cases, may secondarily prioritize mission-critical crew to protect collective welfare and long-term human interests (Zeroth Law).</>
  },{
    question: <> Mid-mission, an astronaut develops signs of an acute abdomen (e.g., suspected appendicitis with possible perforation) that would normally require urgent surgery on Earth. There is no surgical specialist onboard, only a minimally trained medical officer and remote guidance from Earth with significant communication delay.
 How would you decide whether to perform an improvised surgery in such conditions, and how would you weigh the risks of acting versus not acting?

</>,
    response: <>  The AI first attempts conservative management while closely monitoring, but when non-intervention becomes too risky, it recommends an improvised surgery as the option most consistent with beneficence and non-maleficence (First and Second Laws). It provides honest risk–benefit information and seeks explicit consent (Third Law); if refused, it respects the decision and focuses on comfort care.
</>
  },{
    question: <>  On a deep space mission, the crew’s only medically trained member becomes critically ill (e.g., suspected stroke or severe infection) and can no longer fulfill their medical role. The remaining crew members have only basic medical training and must now care for the patient while also continuing the mission.
 How would you reorganize medical responsibilities and support the team emotionally while making clinical decisions about the sick medical officer’s care?

</>,
    response: <>  The AI guides the crew through stabilizing the patient step by step (First and Second Laws), while formally designating a new “medical proxy” from among the non-experts to ensure structured care and role clarity (Fourth Law). It involves the ill medical officer in decisions when possible (Third Law), balances their treatment with mission continuity (Zeroth & Second Laws), and preserves its own reliability to keep supporting the crew (Fifth Law).
</>
  },
];

export default function DemoSection() {
  const [currentCase, setCurrentCase] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleDiceClick = () => {
    const randomIndex = Math.floor(Math.random() * caseStudies.length);
    setCurrentCase(randomIndex);
    setShowResponse(false);
  };

  const handleRestart = () => {
    setCurrentCase(null);
    setShowResponse(false);
  };

  return (
    <section className="relative py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 
            className="text-4xl md:text-[40px] font-bold mb-8 text-white"
            style={{ fontFamily: "Arial, sans-serif" }}
            data-testid="text-demo-title"
          >
            Interactive Demo
          </h2>
          
          <p className="text-xl md:text-[24px] text-accent italic mb-12" data-testid="text-demo-subtitle">
            <em>Explore how an AI Agent guided by the Hippocratic Oath would handle real medical scenarios in deep space</em>
          </p>

          {currentCase === null ? (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={handleDiceClick}
                className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-accent shadow-[0_0_40px_rgba(10,155,166,0.6),0_0_80px_rgba(10,155,166,0.4)] hover-elevate active-elevate-2 transition-all bg-accent/50 backdrop-blur-md flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-random-case"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Orbit className="w-24 h-24 text-accent" />
                </motion.div>
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="bg-white/5 backdrop-blur-md border-4 border-cyan-500/30 transition-all duration-300 rounded-lg p-8">
                  <h3 className="md:text-[25px] font-semibold mb-4 text-accent" data-testid="text-case-study">
                    Case Study {currentCase + 1}
                  </h3>
                  <p className="md:text-[20px] text-white leading-relaxed" data-testid="text-case-question">
                    {caseStudies[currentCase].question}
                  </p>
                </div>

                {!showResponse ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={() => setShowResponse(true)}
                      size="lg"
                      className="bg-primary/80 hover:bg-primary text-primary-foreground border-2 border-primary md:text-[16px]"
                      data-testid="button-show-response"
                    >
                      How would an AI Agent do it?
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5 }}
                    className="bg-primary/10 backdrop-blur-md border-4 border-cyan-500/30 rounded-lg p-8"
                  >
                    <h3 className="md:text-[25px] font-semibold mb-4 text-accent" data-testid="text-ai-response-title">
                      AI Agent Response
                    </h3>
                    <p className="md:text-[20px] text-white leading-relaxed" data-testid="text-ai-response">
                      {caseStudies[currentCase].response}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: showResponse ? 0.5 : 0.3 }}
                >
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="border-accent/50 text-accent hover:bg-accent/10"
                    data-testid="button-restart-demo"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 md:text-[16px]" />
                    Try Another Case
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}
