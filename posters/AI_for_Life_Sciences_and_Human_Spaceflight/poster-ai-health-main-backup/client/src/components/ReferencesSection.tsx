import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Reference {
  id: number;
  citation: string;
}

const references: Reference[] = [
  { 
    id: 1, 
    citation: "Chan, C.Y. et al. (2024). The effect of dwelling size on the mental health and quality of life of female caregivers living in informal tiny homes in Hong Kong https://pubmed.ncbi.nlm.nih.gov/39334064/" 
  },
  { 
    id: 2, 
    citation: "Ran, X. (2021). 祝融号:我在火星的100天与1000米. Zhurong Rover: My 100 Days and 1,000 Meters on Mars. Xinhua News Agency. August 26, 2021 http://www.xinhuanet.com/techpro/20210826/13a18357ddad430996c895db3b12ea5c/c.html" 
  },
  { 
    id: 3, 
    citation: "Scott, R.T., Antonsen, E. L., Sanders, L.M., Hastings, J.J.A., Park, S-m, Mackintosh,G, … Costes, S.V. (2021, dec 2022). Beyond Low Earth Orbit: Biomonitoring, Artificial Intelligence, and Precision Space Health (Preprint). ar.Xiv https://arxiv.org/pdf/2112.12554" 
  },
  { 
    id: 4, 
    citation: "Zacharia, J. (2025, March 20). How personal health devices and wearables are advancing space health research. TrialX. https://trialx.com/space-health-research-wearable-devices" 
  },
  { 
    id: 5, 
    citation: "Chustecki, M. (2024). Benefits and Risks of AI in Health Care: Narrative Review. Interactive Journal of Medical Research, Vol. 13:e53616. https://www.i-jmr.org/2024/1/e53616" 
  },
  { 
    id: 6, 
    citation: "Khan, B., Fatima, H., Qureshi, A., Kumar, S., Hanan, A., Hussain, J., & Abdullah, S. (2023). Drawbacks of Artificial Intelligence and Their Potential Solutions in the Healthcare Sector. Biomedical materials & devices (New York, N.Y.), 1–8. Advance online publication. https://doi.org/10.1007/s44174-023-00063-2" 
  },
  { 
    id: 7, 
    citation: "Yousif, N. (2025, August 27). Parents of teenager who took his own life sue openai. BBC News. https://www.bbc.com/news/articles/cgerwp7rdlvo" 
  },
  { 
    id: 8, 
    citation: "Muir, R. (2025, September 8). Murderous artificial emotional intelligence?. Law People. https://www.lawpeopleblog.com/2025/09/murderous-artificial-emotional-intelligence/" 
  },
  { 
    id: 9, 
    citation: "Varkey, B. (2021). Principles of Clinical Ethics and Their Application to Practice. Medical Principles and Practice, 30 (1): 17–28. https://doi.org/10.1159/000509119" 
  }
];

export default function ReferencesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="references" className="py-16 px-6 relative scroll-mt-20">
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8 text-white text-center"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
            data-testid="text-references-title"
          >
            References
          </h2>
          
          <div className="space-y-4">
            {references.map((ref) => (
              <motion.div
                key={ref.id}
                id={`ref-${ref.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: ref.id * 0.05 }}
                className="flex gap-3 scroll-mt-24"
                data-testid={`reference-${ref.id}`}
              >
                <span className="text-accent font-bold text-sm flex-shrink-0 mt-0.5">
                  [{ref.id}]
                </span>
                <p className="text-base text-white leading-relaxed">
                  {ref.citation}
                </p>
              </motion.div>
            ))}
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
