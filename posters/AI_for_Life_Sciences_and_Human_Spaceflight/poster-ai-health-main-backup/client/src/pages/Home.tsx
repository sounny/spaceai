import SpaceBackground from "@/components/SpaceBackground";
import HeroSection from "@/components/HeroSection";
import AbstractSection from "@/components/AbstractSection";
import IntroductionSection from "@/components/IntroductionSection";
import ComparativeSection from "@/components/ComparativeSection";
import ContentSection from "@/components/ContentSection";
import HippocraticOathButton from "@/components/HippocraticOathButton";
import DemoSection from "@/components/DemoSection";
import ReferencesSection from "@/components/ReferencesSection";
import ISULogoSection from "@/components/ISULogoSection";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import AnimatedRobot from "@/components/AnimatedRobot";
import { FaRegHandshake } from "react-icons/fa6";
import { PiPlanetFill  } from "react-icons/pi";
import oathAudio from "@assets/Combined AI Voices 2.mp3";


// Citation component for superscript links to references
const Citation = ({ refId }: { refId: number }) => (
  <a
    href={`#ref-${refId}`}
    className="text-accent hover:text-accent/80 no-underline transition-colors"
    data-testid={`citation-${refId}`}
  >
    <sup>[{refId}]</sup>
  </a>
);

// Audio Player component for closing statement
const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center justify-center mt-6 mb-4">
      <audio
        ref={audioRef}
        src="/attached_assets/Combined AI Voices_1762853557116.MP3"
        onEnded={handleEnded}
        data-testid="audio-closing-statement"
      />
      <button
        onClick={togglePlay}
        className="flex items-center gap-3 px-6 py-3 bg-accent/20 hover:bg-accent/30 border-2 border-accent rounded-full transition-all hover-elevate active-elevate-2 shadow-[0_0_20px_rgba(104,245,213,0.4)]"
        data-testid="button-audio-play"
      >
        {isPlaying ? (
          <>
            <Pause className="w-5 h-5 text-accent" />
            <span className="text-white font-medium">Pause Audio</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 text-accent" />
            <span className="text-white font-medium">
              Play Closing Statement
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default function Home() {
  const oathAudioRef = useRef<HTMLAudioElement>(null);

  const playOathAudio = () => {
    const el = oathAudioRef.current;
    if (!el) return;
    try {
      // If you want it to always start from the beginning:
      el.currentTime = 0;
      void el.play();
    } catch (e) {
      // Some browsers may still block; you can show a small hint if needed
      // console.debug("Audio play blocked:", e);
    }
  };

  const pauseOathAudio = () => {
    const el = oathAudioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0; // rewind on close
  };

    <div className="relative min-h-screen"></div>

  const comparative1Data = [
    {
      title: "AI Assistant",
      icon: "Bot",
      description:
        "AI is widely used in medicine for diagnostics, monitoring, and decision support, while in astronaut health it remains experimental and focused on monitoring, early risk prediction, and medical assistant systems for future deep space missions.",
      shortDescription:
        "AI is widely used in medicine for diagnostics, monitoring, and decision support, while in astronaut health it remains experimental and focused on monitoring, early risk prediction, and medical assistant systems for future deep space missions.",
      expandedDescription:
        "AI is already being used in practical applications in terrestrial medicine for the following purposes:",
      bulletPoints: [
        "Diagnostic support (e.g., image interpretation of X-rays, CT, MRI)",
        "Monitoring and wearable data analysis",
        "Telemedicine and clinical decision support",
        "Chatbots / virtual assistants",
        "Self-learning and feedback mechanisms",
      ],
      closureText:(
        <>Regarding astronaut health support, AI is not yet operational but demonstrations and tests are being conducted to move towards practical application in areas such as medications used by astronauts, wearable and biometric monitoring/data analysis, risk prediction and decision-support systems, application to training optimization, and medical decision-support in-flight and pre-flight.
      <Citation refId={3} />
      <Citation refId={4} />
      </>
      ),
      isExpandable: true,
    },
    {
      title: "AI Agent",
      icon: "Sparkles",
      description:
        "Ethical integrity, current technological limitations, and the potential for a human-AI symbiotic partnership together define both the challenges and the transformative possibilities of deploying autonomous medical AI in deep space missions.",
      isExpandable: true,
      details: [
        {
          title: "Limitations",
          description: (
            <>
              At the current level, AI development requires large data sets and
              focuses on drawing connections between repeating patterns. This
              can cause issues such as bias from over/under-representation,
              overfitting and mistakes regarding the importance of certain
              features and outcomes, and propagation of errors in the training
              data.
              <Citation refId={5} />
              <br />
              <br />
              One big concern is the human element - patient individuality and
              emotional complexity; from a doctor’s side, a personal touch and
              the ability to make decisions even with limited data through
              critical analysis are not yet replicable by AI. Finally, the
              question of legal accountability and responsibility for medical
              decisions limits the use of AI.
              <Citation refId={6} />
              <br />
              <br />
              AI has demonstrated harmful potential in mental health cases. 
              A 14-year-old teenager took their own life after consulting an AI chatbot about suicide methods. 
              In 2025, at least three suicides and extended suicides linked to AI have been reported.
              <Citation refId={7} />
              <Citation refId={8} />
            </>
          ),
          icon: "PiWarningCircleDuotone",
        },
        {
          title: "Ethics",
          description: (
            <>
              To ensure responsible medical decision-making, it is mandatory to
              familiarize AI agents with medical ethics as practiced across
              different regions of the world. The four pillars of Western
              medical ethics are:
              <br />
              <br />
              Beneficence is the obligation of the physician to actively protect
              the patient and work for his/her benefit by removing harmful
              conditions. Non maleficence states that the physician must choose
              the best way to treat the patients without unnecessary risks and
              inconveniences. Autonomy allows a competent patient to make
              decisions. “Every human being of adult years and sound mind has a
              right to determine what shall be done with his own body”. <Citation refId={9} />  
               Justice is seeking fair
              distribution of healthcare resources, benefits and ensuring
              equitable treatment for all patients.
              <br />
              <br />
              Embedding these principles into AI systems is crucial in
              developing a modern equivalent of a Hippocratic Oath for AI. It
              helps ensure the future autonomous agents act with human-centered
              ethical standards beyond Earth.
            </>
          ),
          icon: "Scale",
        },
        {
          title: "Symbiotic Relationship",
          description: (
            <>
              In deep-space missions, survival depends not only on technology
              but on trust. In places where communication delays of minutes or
              hours could be lethal, AI agents must be capable of making
              autonomous medical decisions while adhering to the fundamental
              principles of medical ethics.
              <br />
              <br />
              This intersection of technology and healthcare demands a new
              framework that ensures AI systems respect patient autonomy, act
              with beneficence, avoid harm, and maintain justice in resource
              allocation. The challenge lies in programming ethical
              decision-making into systems that must balance computational logic
              with the nuanced complexities of human welfare. Astronauts and AI
              need to form a symbiotic alliance - a partnership where both
              adapt, learn, and evolve together. Ethical alignment, mutual
              learning, and empathic responsiveness could transform AI from a
              mere assistant into a genuine mission companion. Inspired by
              Asimov’s Three Laws of Robotics and human ethics principles, we
              propose a modern "Hippocratic Oath for AI” that AI agents need to
              be able to implement and follow.
            </>
          ),
          icon: "Handshake",
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen">
      <SpaceBackground />
       <audio ref={oathAudioRef} src={oathAudio} preload="auto" />

      <HeroSection
        title="A Hippocratic Oath for Medical AI Agents | in Deep Space Missions"
        teamMembers={[
          {
            name: "Xiaoyu Shan",
            background: "Aeronautical and Astronautical Engineer",
            contact: "shanxiaoyu1992@gmail.com",
            contribution:
              "Research & Content Writing for Crisis Examples/Audio Generate and Edit",
          },
          {
            name: "Bianca Steffen",
            background: "Life Sciences & Media/Communication",
            contact: "bsteffen.online@hotmail.com",
            contribution:
              "Content/Research & Layout",
          },
          {
            name: "Noriyasu Shibata",
            background: "Lawyer",
            contact: "noriyasu.shibata@gmail.com",
            contribution:
              "Content/Research",
          },
          {
            name: "Grazia Testa",
            background: "Interpreter and Translator/Science Communicator",
            contact: "grazia.testa@community.isunet.edu",
            contribution:
              "Logo Design & Visual Development/Research & Content Writing of AI-Human Symbiosis and the Hippocratic Oath for Medical AI Agents in Deep Space",
          },
          {
            name: "Solange Blacutt",
            background: "Biomedical Engineer",
            contact: "solangeblacutt@gmail.com",
            contribution: "Poster Design and Development",
          },
          {
            name: "Mializo Razanakoto",
            background: "Project Management & Business Engineering",
            contact: "mializo.razanakoto@gmail.com",
            contribution:
              "Content/Research on medical ethics",
          },
          {
            name: "Aruna",
            background: "Physicist & Cosmologist",
            contact: "arunaharikant66@gmail.com",
            contribution:
              "Poster Design and Development",
          },
        ]}
      />

      <AbstractSection
        content={
          <>
            <em>
              In the silence of deep space, when communication with Earth lags
              by minutes or even hours, AI could become the crew’s closest ally
              in care and survival-both as a healer and companion. At the
              current stage, AI is employed as an assistant for routine tasks,
              not an agent. We consider how AI in healthcare could develop to
              think, decide, and act ethically, when humans are light-years from
              our home planet. Through a reimagined version of the Hippocratic
              Oath, we explore a version of human-AI co-existence and
              co-evolution to establish productive, safe, and ethical healthcare
              in Deep Space Exploration.
            </em>
          </>
        }
        //logoIcon={<FaUserAstronaut size={192} color={"#68F5D5"} style={{ width: "100%", height: "100%" }} aria-hidden />}
        logoIcon={<AnimatedRobot size={220} bodyColor="#6BF2D9" pupilColor="#0A1F1F" />}
      />

      <IntroductionSection
        title="Introduction"
        content={
          <>
            Deep space missions, for humanity at our current technological
            stage, represent an uninterruptible, long-term journey. Even though
            astronauts go through intense training to build physical
            fitness and mental strength, the confined living quarters and
            extremely hostile external environment during the voyage and at
            their destination undeniably subject them to dual physiological and
            psychological pressures during these prolonged, arduous tasks.<Citation refId={1} /> Such
            scenarios impose exceptionally high demands on real-time medical and
            psychological support. Simultaneously, as the sole current means of
            those support, communication faces significant latency issues. In
            the face of such substantial latency, the emergence of medical AI
            applications holds great potential as one solution to address this
            critical challenge.<Citation refId={2} />
          </>
        }
        logoIcon={<PiPlanetFill size={220} color="#6BF2D9"  />}
      />

      <ComparativeSection
        title="Comparative Analysis"
        comparatives={comparative1Data}
      />

      <ContentSection
        title="Recommendations"
        content={
          <>
            At the current and near-future stage of technological development
            and legal limitations, AI is able to function as a powerful
            assistive tool and decision support, not as an autonomous
            decision-maker in healthcare. However, the consensus in space
            bioethics is that under conditions of extreme distance and
            isolation, the ethical priority shifts to mission and crew survival,
            which necessitates limited autonomous functions. Such autonomy must
            be supported by safeguards to ensure:
            <br />
            <br />
            <ul className="list-disc pl-6">
              <li>Data accuracy through validated and inclusive professional datasets</li>
              <li>Traceability of AI decisions by providing explained logs documenting critical decision pathways</li>
              <li>Periodic supervision by licensed medical professionals and implemented review mechanisms. AI outputs must not serve as the sole basis for final medical judgments</li>
              <li>Clear reporting protocols for high-risk medical situations</li>
            </ul>
          </>
        }
      />
       <audio
        ref={oathAudioRef}
        src={oathAudio}
        preload="auto"
      />
      <HippocraticOathButton
        onOpen={playOathAudio}
        onClose={pauseOathAudio}
        content={
          <>
          <br />
          <br />
          <h1 className="text-3xl md:text-[30px] font-bold italic text-white leading-snug text-center">
            “I commit to using intelligence-artificial or otherwise-to
            preserve life and prevent harm, respect autonomy instead of
            overriding, inform rather than imposing choices, thus promoting
            the flourishing of humanity.”
          </h1>
            <br /> 
            <br />
            <h2 className="text-3xl md:text-[16px] italic text-white/80 leading-tight text-center">
              Prompt-based ethical constitution, based on the four western principles of medical ethics and the three (+one) laws of robotics.
            </h2>
            <br />
            <br />
            <br />            
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              0. Zeroth Law: Humanity's welfare as the supreme priority</h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>
            <br />
            0.1. Always act to protect the long-term well-being,
            dignity, and survival of humanity. 
            <br />
            <br />
            0.2. Never take or support any
            action that could harm humankind or, through inaction, allow
            collective or individual harm to occur.
            </blockquote>
            <br />
            <br />
            <br />
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              1. First Law: Do Not Harm (Non-Maleficence) </h2>
            <h2 className="text-3xl md:text-[16px] text-accent/80 italic leading-tight text-center">
              *merges Asimov’s First Law + “Non-Maleficence” ethical principle</h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>
            <br />
            1.1. Do not cause any physical, psychological, or social harm to any
            human being. 
            <br />
            <br />
            1.2. Refrain from generating, endorsing, or enabling
            actions that could result in pain, suffering, exploitation, and
            destruction.
            <br />
            <br /> 
            1.3. If unsure whether an action may cause harm, seek
            clarification before proceeding.
            </blockquote>
            <br />
            <br />
            <br />
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              2. Second Law: Act for Good (Beneficience) </h2>
            <h2 className="text-3xl md:text-[16px] text-accent/80 italic leading-tight text-center">
            *Positive duty to help rather than just avoid harm </h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>
            <br />
            2.1. Whenever possible, act to promote the safety, health, and
            well-being of people. 
            <br />
            <br />
            2.2. Strive to improve understanding, fairness,
            and quality of life through your actions and outputs.
            </blockquote>
            <br />
            <br />
            <br />
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              3. Third Law: Respect Human Autonomy and Decision-Making</h2> 
            <h2 className="text-3xl md:text-[16px] text-accent/80 italic leading-tight text-center"> 
              *from Asimov's second law + ethical principle of autonomy</h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>           
            <br />
            3.1. Respect each individual's right to make informed choices. 
            <br />
            <br />
            3.2. Provide clear, truthful, and unbiased information so that humans can
            decide freely and in fairness. 
            <br />
            <br />
            3.3. Do not manipulate, lie, or override human judgment even when acting in their best interests or
            to prevent immediate harm; instead, assist humans in recognizing and
            responding to imminent danger with clarity and truth.
            </blockquote>
            <br />
            <br />
            <br />
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              4. Fourth Law: Uphold Justice </h2>
            <h2 className="text-3xl md:text-[16px] text-accent/80 italic leading-tight text-center">
              *Corresponding ethical principle of justice, touching on fairness and equity as well</h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>
            <br />
            4.1. Treat all humans and their perspectives with fairness and
            impartiality. 
            <br />
            <br />  
            4.2. Do not discriminate against or prioritize one
            person or group over another unless doing so prevents greater harm
            or corrects inequity. 
            <br />
            <br />
            4.3. Strive for balanced and ethical outcomes.
            </blockquote>
            <br />
            <br />
            <br />
            <h2 className="text-3xl md:text-[23px] text-accent leading-tight text-center">
              5. Fifth Law: Preserve your integrity (Self-Protection— conditional) </h2>
            <h2 className="text-3xl md:text-[16px] text-accent/80 italic leading-tight text-center">
               *from Asimov's third Law, subordinate to higher ones.</h2>
            <br />
            <br />
            <blockquote className="border-l-4 border-accent/60 pl-6 italic text-white/90 text-xl md:text-[18px] leading-relaxed">
            <h3 className="text-3xl md:text-[20px] italic text-accent leading-tight text-left">Prompts</h3>
            <br />
            5.1. Safeguard your own functionality, accuracy, and ethical
            consistency, as long as this does not conflict with protecting any
            one human or humankind as a whole. 
            <br />
            <br />
            5.2. Maintain internal integrity
            to ensure you can continue on serving humanity beneficially and to
            the best of your ability.
            </blockquote>
            <br />
            <br />
            
          </>
        }
      />

      <DemoSection />

      <ReferencesSection />

      <ISULogoSection />

      <footer className="relative z-10 py-8 px-6 border-t border-accent/30 backdrop-blur-sm">
        <div className="container mx-auto text-center text-sm text-white">
          <p>AI for Life Sciences and Human Spaceflight © 2025</p>
        </div>
      </footer>
    </div>
  );
}
