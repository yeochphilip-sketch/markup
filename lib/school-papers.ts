/**
 * ═══════════════════════════════════════════════════════════════
 *  SCHOOL PAPER QUESTION BANK
 *  Real MOE school paper examples extracted from:
 *  - papers_ss/  (Victoria School, Montfort, Marsiling)
 *  - papers_hist/ (Deyi, CCHM, Edgefield, St. Margaret's, Beatty)
 *
 *  These are used as FEW-SHOT EXAMPLES in AI prompts so the
 *  AI generates questions and model answers that match actual
 *  Singapore MOE teacher / school standards.
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export interface SchoolSource {
  label: string;        // e.g. "Source A", "Source B"
  provenance: string;   // source attribution/context
  content: string;      // the source text
}

export interface SBCSQuestion {
  part: string;         // "a", "b", "c", "d", "e"
  question: string;
  marks: number;
  lormsSummary: string; // brief LORMS level breakdown
}

export interface SchoolPaper {
  school: string;
  year: number;
  subject: 'Social Studies' | 'History';
  topic: string;
  backgroundContext: string;
  sources: SchoolSource[];
  sbcsQuestions: SBCSQuestion[];
  hasModelAnswers: boolean;
}

export interface ModelAnswerSection {
  part: string;
  question: string;
  lormsBreakdown: string; // full LORMS descriptor text
}

export interface SchoolModelAnswer {
  school: string;
  year: number;
  subject: 'Social Studies' | 'History';
  topic: string;
  sections: ModelAnswerSection[];
}

// ═══════════════════════════════════════════════════════════════
//  VICTORIA SCHOOL SS 2020 — "Zero-Waste Nation"
//  Complete paper + model answer (GOLD STANDARD)
// ═══════════════════════════════════════════════════════════════

export const VICTORIA_SS_2020: SchoolPaper = {
  school: 'Victoria School',
  year: 2020,
  subject: 'Social Studies',
  topic: 'Exploring Citizenship and Governance — Zero-Waste Nation',
  backgroundContext: `Waste generation has become a serious problem in Singapore. The only landfill in Singapore, Pulau Semakau is currently projected to last only till 2035 based on the current rate of waste generation. In 2018, Singapore generated 7.7 million tonnes of waste, equivalent to the weight of 530,000 double-decker buses. To solve this unsustainable pattern of waste generation the Singapore government initiated the Zero-Waste Campaign in 2019. Individual lifestyle changes were one of the main foci of the campaign; mainly to encourage Singaporeans to reduce, reuse and recycle. The government has taken steps to further encourage domestic recycling by creating additional recycling chutes in newer public housing flats. At the end of 2019, The National Environment Agency (NEA) revealed that although the amount of waste generated decreased, recycling rates also decreased in Singapore. Therein lies the question of whether Singapore can become a zero-waste nation.`,
  sources: [
    { label: 'Source A', provenance: 'A cartoon about recycling in Singapore, May 2010.', content: 'A cartoon showing a child recycling and an adult saying "Don\'t do that!! You\'re not a Karang guni man!" *Karang guni – Rag and bone men who visit neighbourhoods to collect unwanted household items.' },
    { label: 'Source B', provenance: 'From a project by the Ministry of the Environment and Water Resources (MEWR) to improve household recycling rates, 2019.', content: 'We have decided to target the design of the current recycling bins to facilitate intuitive and conscious recycling process. Through the redesign of the bin, we aim to increase public awareness about the process of recycling right and reduce contamination of recyclables in recycling bins. This project is mainly targeted towards the HDB households. We hope to create a transparent bin which may make people more conscious of what they are placing into the bin, serving as a deterrence to those who wish to contaminate the recyclables. Notices are also to be placed at a person\'s eye-level which would catch people\'s attention and allow them to visualise what is allowed to be recycled with minimal effort.' },
    { label: 'Source C', provenance: 'From an article posted by Channel News Asia, August 2020.', content: 'Before bringing my recyclables down to the blue bins, I always take the time to clean or wash the items that accumulate in my recycling corner. My mother and I make sure to remove all the non-recyclable parts like stickers and loose plastic packaging. For cardboard boxes we even try to cut out the parts with plastic or tape that cannot be removed before recycling the rest. But many Singaporeans are still not very educated about how to recycle properly. And most will not go to the same lengths or even further. For example, not everyone will remember or take the effort to remove the non-recyclable parts. Do you really think that Singaporeans in general will take the time out to do that when they don\'t even take the time to do simple things?' },
    { label: 'Source D', provenance: 'From an interactive online news article created by The Straits Times, April 2019.', content: 'We like shopping online, but it leads to lots of packaging waste. As we observe Earth Day on April 22, take a closer look at the problem, so we can fight it. Tweet photos, clips and stories of packaging waste, or post them on Instagram and Facebook using the hashtag: #STpackagingwaste. [Infographic shows 82% non-product volume in e-commerce packaging]' },
    { label: 'Source E', provenance: 'From a Facebook response to a news article on poor recycling in Singapore, August 2020.', content: 'Don\'t just put a big blue bin and expect everyone to know what to do. How can you just have one bin and call it a recycle bin? The government should have separators in the bins like the ones in Taiwan. How do you expect people to separate the different types of recyclables when there are no separators in the bin? In my house, we always categorise the items by putting them into different bags but in the end we can only dump everything into the big blue bin. I wonder how do our recycling center sort out all these, with many unrecyclable trash in it as well? Or in the end do all the things that we put into the big blue bin just get thrown away? You can\'t blame the public for the mix-ups of recyclables and trash when the bins are not helpful!' },
    { label: 'Source F', provenance: 'A photograph of the \'reverse\' vending machines during the launch by NEA, November 2019. *\'Reverse\' vending machines gives out vouchers when recyclables are put in.', content: '[Photograph of Singaporeans queuing at reverse vending machines that give out vouchers when recyclables are deposited]' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. What is the message of this cartoon? Explain your answer.', marks: 6, lormsSummary: 'L1: Description [1] → L2: General statements [2] → L3: Sub-message (parents blamed/mocked) [3] → L4: Message (recycling seen as negative/undesirable by adult Singaporeans) [4-5] → L5: Message with broader outcome (shared responsibility, change of mindset) [6]' },
    { part: 'b', question: 'Study Sources B and C. Does the resident in Source C think that the project in Source B will work? Explain your answer.', marks: 7, lormsSummary: 'L1: Provenance/Mismatch [1-2] → L2: No clear basis of comparison [3] → L3: Will work OR Will NOT work based on content [4-5] → L4: Will work AND Will NOT work [6] → L5: Will NOT work based on Perspective (cynical resident, root cause) [7]' },
    { part: 'c', question: 'Study Source D. Why do you think this source was published? Explain your answer.', marks: 7, lormsSummary: 'L1: Literal description [1] → L2: Context (rising e-commerce, Earth Day) [2] → L3: Message (raise awareness about e-commerce waste) [3] → L4: General Purpose with Outcome [4] → L5: L4 + Context [5] → L6: Specific Purpose with Outcome [6] → L7: L6 + Context about larger issue (Pulau Semakau, zero-waste campaign) [7]' },
    { part: 'd', question: 'Study Source E. How useful is this source as evidence about Singaporeans\' attitude towards recycling? Explain your answer.', marks: 7, lormsSummary: 'L1: Useful — common sense [1] → L2: Not Useful — Typicality [2] → L3: Useful (sub-message — not addressing attitude) [3] → L4: Useful (main message — frustration, positive attitude but frustrated) [4] → L5: Useful (cross-reference to C) [5] → L6: Not Useful (cross-reference typicality) [6] → L7: Not Useful (over-exaggeration + pushing of blame) [7]' },
    { part: 'e', question: 'Study Source F. How far does this source prove that Singaporeans are becoming more interested in recycling? Explain your answer.', marks: 8, lormsSummary: 'L1: Provenance [1] → L2: Typicality [2] → L3: Does prove (content) [3] → L4: Does prove/Does not prove (cross-reference) [4] → L5: Content elaborated (launch novelty / monetary rewards) [5-6] → L6: Does not prove (Purpose — NEA agenda) [7] → L7: Cross-reference to Background Information [8]' },
  ],
  hasModelAnswers: true,
};

/**
 * Victoria School SS 2020 — Complete Model Answer (excerpts)
 * Real MOE teacher-written LORMS breakdown
 */
export const VICTORIA_SS_2020_ANSWERS: SchoolModelAnswer = {
  school: 'Victoria School',
  year: 2020,
  subject: 'Social Studies',
  topic: 'Zero-Waste Nation',
  sections: [
    {
      part: '1a',
      question: 'What is the message of this cartoon? Explain your answer.',
      lormsBreakdown: `L4 Message (4-5m): The message is that recycling is seen as negative / undesirable act by many adult Singaporeans. This is because many feel that it is not their responsibility and it should be the responsibility of those who earn/are paid to do these jobs such as the Karang Guni men.

L5 Message with broader outcome (6m): The message of this cartoon is to create a sense of shared responsibility among Singaporeans toward recycling (source was created in 2010). In the past since recycling was perceived to be undesirable act, it was necessary for actions to be taken to have a change of mindset among Singaporeans and work together for the good of society — protecting the environment.`
    },
    {
      part: '1b',
      question: 'Does the resident in Source C think that the project in Source B will work?',
      lormsBreakdown: `L4 Will work AND Will NOT work based on content (6m):
Will work — as the new bin educates residents of how to recycle. Source B — "we aim to increase public awareness about the process of recycling right and reduce contamination"..."Notices are also to be placed at a person's eye-level...visualise what is allowed to be recycled with minimal effort". Source C — "...many are still not very educated about how to recycle properly..."
Will not work — convenience. Source B — "We hope to create a transparent bin which may make people more conscious..." Source C — "Do you really think that Singaporeans in general will take the time out to do that when they don't even take the time to do simple things?" Will not work as most Singaporeans may still throw things that do not belong to the recycling bin even if the bin is transparent as the process of recycling right is too tedious and time consuming.

L5 Will not work based on Perspective (7m): The resident would not think that the project will work as she feels cynical/negative that Singaporeans will change their mindset and put in the time to recycle properly. Source B's project may not address the root cause which is Singaporean's behaviour as it is only dealing with the bin's structure.`
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  DEYI SECONDARY HISTORY 2024 — "Korean War: US Intervention"
//  Complete paper + marking scheme (GOLD STANDARD)
// ═══════════════════════════════════════════════════════════════

export const DEYI_HISTORY_2024: SchoolPaper = {
  school: 'Deyi Secondary School',
  year: 2024,
  subject: 'History',
  topic: 'Korean War — Was US Intervention a Strategic Error?',
  backgroundContext: `After World War II, Korea was divided politically into two zones along the 38th parallel. In 1948, following the withdrawal of foreign troops, the North remained under Communist control led by Kim Il Sung, while the South adopted an anti-communist stance under Syngman Rhee. South Korea received support from the United States and the United Nations, while North Korea was backed by China and the Soviet Union. Both leaders were hostile towards each other and sought to unify the country through military force. South Korea initially launched border attacks near the Taedong River but were repelled by North Korean forces. Then, on June 25, 1950, North Korea launched a full-scale invasion of South Korea by crossing the 38th parallel. The UN Security Council passed a resolution calling for military intervention to repel the invasion. On September 1950, the USA led the UN multinational force to liberate Seoul.`,
  sources: [
    { label: 'Source A', provenance: 'Adapted from \'A New Look At The Korean War\', an article published by Veterans for Peace. Veterans for Peace is an American organisation which seeks to promote alternatives to war.', content: 'The official American history is that the Korean War started on June 25, 1950 when the North Korean forces suddenly attacked the South under Stalin\'s order. This is a gross misrepresentation of the origin of the War. For one thing certain now, according to the Russian documents declassified, is that Stalin did not order Kim Il Sung to start the War. On the contrary, it was Kim Il Sung who sought permission to attack the South in case the North was attacked. The truth is that the Korean War really started in 1945 when the U.S. suppressed the Korea People\'s Republic (KPR) government and imposed its military rule in the southern part of Korea.' },
    { label: 'Source B', provenance: 'An American cartoon published in June 1950.', content: '[Cartoon showing North Korean military leader explaining to a confused Korean man how the South invaded the North first, using an upside-down map]' },
    { label: 'Source C', provenance: 'A speech made by President Truman, 19th July 1950.', content: 'On Sunday, June 25th, Communist forces attacked the Republic of Korea. This attack has made it clear, beyond all doubt, that the international Communist movement is willing to use armed invasion to conquer independent nations. An act of aggression such as this creates a very real danger to the security of all free nations. The attack upon Korea was an outright breach of the peace and a violation of the Charter of the United Nations. By their actions in Korea, Communist leaders have demonstrated their contempt for the basic moral principles on which the United Nations is founded. This is a direct challenge to the efforts of the free nations to build the kind of world in which men can live in freedom and peace. This challenge has been presented squarely. We must meet it squarely.' },
    { label: 'Source D', provenance: 'Adapted from an excerpt of the official North Korean history of the Korean War, published in 1993.', content: 'The US imperialists was the strongest in the world. With a view to conquering North Korea, the US imperialist invaders sent into the Korean war over two million soldiers, including one-third of their ground forces, one-fifth of their air force and the greater part of their Pacific Fleet, along with over 73 million tons of combat equipment. US imperialists, who had harboured the wild dream of dominating the world with Korea as the springboard, instigated the South Korean puppet government to launch a surprise armed invasion of the North Korea at early dawn on June 25, 1950.' },
    { label: 'Source E', provenance: 'From Dean Acheson\'s memoirs written in 1969. Acheson was a leading member of Truman\'s government and oversaw American foreign policy during the Korean War.', content: 'Clearly the invasion of South Korea by North Korea was an open, undisguised challenge to America\'s internationally accepted position as the protector of South Korea, an area of great importance to the security of American-occupied Japan. Backing away from this challenge would be highly destructive to our strength and reputation.' },
    { label: 'Source F', provenance: 'A pamphlet dropped on US troops during the Korean war, 1951, by the Chinese People\'s Volunteers.', content: 'Dear Soldiers, It is Christmas and you are far from home, suffering from cold not knowing when you will die. The big shots are home enjoying themselves, eating good food, drinking good liquor, why should you be here risking your life for their profits? The Koreans and Chinese don\'t want to be your enemies. Our enemies and yours are those who sent you here and destroyed your happiness. Soldiers! Let\'s join hands! You should be back home with those you love and want you back, safe and sound.' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. Are you surprised by what the source says? Explain your answer.', marks: 6, lormsSummary: 'L1: Undeveloped provenance [1] → L2: Surprised/Not surprised for content [2-3] → L3: Evaluation by cross-reference/CK [4-5] → L4: Not surprised based on purpose in context [6]' },
    { part: 'b', question: 'Study Source B. Why was this cartoon published in June 1950? Explain your answer.', marks: 5, lormsSummary: 'L1: Sub-message [1] → L2: Specific context of June 1950 [2] → L3: Main message (mock/ridicule North Koreans) [3-4] → L4: Reason based on purpose (stir hatred/anger, support US) [5]' },
    { part: 'c', question: 'Study Sources C and D. Does Source D prove Source C wrong? Explain your answer.', marks: 6, lormsSummary: 'L1: Undeveloped provenance [1] → L2: They agree, D does not prove C wrong [2] → L3: They disagree, D does prove C wrong [3] → L4: Both aspects [4] → L5: Disagreement + cross-reference to decide [5] → L6: Purpose evaluation [6]' },
    { part: 'd', question: 'Study Source E. What does this source show you about the reason for US intervention in Korea?', marks: 5, lormsSummary: 'L1: Describes the source [1] → L2: Misinterpretation [2] → L3: Details not explained [3] → L4: Main message + reason (protect reputation, appear strong) [4-5]' },
    { part: 'e', question: '\'The U.S. intervention in Korea was a strategic error.\' How far do these sources support this view? Use the sources and your knowledge to explain your answer.', marks: 8, lormsSummary: 'L1: Writes about hypothesis, no valid source use [1] → L2: Yes OR No, supported by source use [2-4] → L3: Yes AND No, supported by source use [5-7] → +Bonus for CK evaluation of reliability/sufficiency (+1, +1 up to 8)' },
  ],
  hasModelAnswers: true,
};

// ═══════════════════════════════════════════════════════════════
//  EDGEFIELD HISTORY 2024 — "Korean War: Regional vs Cold War"
//  Complete paper + LORMS marking scheme
// ═══════════════════════════════════════════════════════════════

export const EDGEFIELD_HISTORY_2024: SchoolPaper = {
  school: 'Edgefield Secondary School',
  year: 2024,
  subject: 'History',
  topic: 'Korean War — Regional Conflict vs Cold War Conflict',
  backgroundContext: `The Korean War began when North Korean forces crossed the 38th parallel and invaded South Korea on 25 June 1950. This invasion led to a swift response from the United Nations, with the USA leading a coalition to repel the North Korean forces. Traditionally, the war is seen as part of the broader Cold War struggle between the USA and the Soviet Union. However, regional issues and security concerns also played significant roles. Both China and the Soviet Union had strategic interests in supporting North Korea to maintain a buffer state and preventing a US-aligned Korea on their borders. The conflict ended in a stalemate with the signing of the Korean Armistice Agreement on 27 July 1953.`,
  sources: [
    { label: 'Source A', provenance: 'A statement by American President Harry Truman, 27 June 1950.', content: 'The Security Council of the United Nations called upon the invading troops to cease hostilities and to withdraw to the 38th parallel. This they have not done, but on the contrary have pressed the attack. The Security Council called upon all members of the United Nations to render every assistance to the United Nations in the execution of this resolution. In these circumstances I have ordered United States air and sea forces to give the Korean Government troops cover and support. The attack upon Korea makes it plain beyond all doubt that Communism has passed beyond the use of subversion to conquer independent nations and will now use armed invasion and war.' },
    { label: 'Source B', provenance: 'Excerpt from a speech by China\'s Chairman, Mao Zedong, October 1950.', content: 'To leading comrades of the Chinese People\'s Volunteers at all levels: In order to support the Korean people\'s war of liberation and to resist the attacks of U.S. imperialism and its running dogs, thereby safeguarding the interests of the people of Korea, China and all the other countries in the East, I herewith order the Chinese People\'s Volunteers to march speedily to Korea and join the Korean comrades in fighting the aggressors and winning a glorious victory.' },
    { label: 'Source C', provenance: 'Adapted from a CIA National Intelligence Estimate report on Chinese intervention in the Korean War, November 1950.', content: 'Communist China\'s decision to send troops to North Korea, risking a wider conflict, likely had Soviet approval or direction. The immediate reason for Chinese assistance was the crossing of the 38th Parallel by US forces and the swift collapse of North Korean resistance. Without Chinese intervention, UN forces would have soon secured the Yalu River line. Faced with this, the Chinese decided to prevent an early UN military victory and maintain a Communist regime on Korean soil.' },
    { label: 'Source D', provenance: 'An American leaflet dropped on North Korea during the Korean War. Text: "The communist aggressor is enslaving your country like a giant octopus."', content: '[Cartoon showing communist powers as a giant octopus with tentacles squeezing North Korea and its civilians, with text "Destroy the communist devil!"]' },
    { label: 'Source E', provenance: 'A telegram from Stalin to Mao Zedong, 26 October 1949.', content: 'We agree with your opinion that the Korean People\'s Army ought not to pursue an attack at the present time. At one time we also pointed out to the Korean friends that the attack on the south by the Korean People\'s Army should not be undertaken since this attack had not been prepared from either a military or a political standpoint.' },
    { label: 'Source F', provenance: 'An extract from an article published by two Chinese historians in London in 1990.', content: 'It is clear the reasons why China entered the Korean War were primarily security concerns. Fearing a growing military threat from the US and believing that Sino-American military confrontation was inevitable, CCP leaders maintained that it might be wise for them to select the time and place. When American troops, despite Chinese warnings, crossed the 38th parallel and marched towards the Yalu River, the People\'s Republic of China entered the conflict in support of North Korea\'s forces.' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. How useful is this source as evidence of the USA\'s motivations for intervening in the Korean War? Explain your answer.', marks: 5, lormsSummary: 'L1: Provenance only [1] → L2: Source content only [2-3] → L3: L2 + cross-reference/CK [4] → L4: Not entirely useful based on origin and purpose [5]' },
    { part: 'b', question: 'Study Source B. Why do you think Mao made this speech? Explain your answer.', marks: 5, lormsSummary: 'L1: Lifts from source [1] → L2: Context only [2] → L3: Message only [3] → L4: Purpose explained with intended outcome [4-5]' },
    { part: 'c', question: 'Study Source C. Are you surprised by the reasons given for Chinese intervention in the Korean War? Explain your answer.', marks: 6, lormsSummary: 'L1: Provenance only [1] → L2: Source content only [2-3] → L3: L2 + cross-reference/CK [4-5] → L4: Analysis of source origin and purpose [6]' },
    { part: 'd', question: 'Study Sources D and E. How far does Source E prove that Source D was wrong about the communist powers? Explain your answer.', marks: 6, lormsSummary: 'L1: General comments on provenance [1] → L2: Content comparison [2-3] → L3: L2 + cross-reference [4-5] → L4: Critical examination of origin and purpose [6]' },
    { part: 'e', question: '\"The Korean War was a regional conflict rather than a Cold War conflict.\" How far do these sources support this view? Use the sources and your knowledge to explain your answer.', marks: 8, lormsSummary: 'L1: Writes about hypothesis, no valid source use [1] → L2: Yes OR No, supported by source use [2-4] → L3: Yes AND No, supported by source use + CK bonus for evaluation [5-8]' },
  ],
  hasModelAnswers: true,
};

// ═══════════════════════════════════════════════════════════════
//  MONTFORT (MFSS) SS 2024 — "Declining Birth Rates"
//  Full question paper (no model answers)
// ═══════════════════════════════════════════════════════════════

export const MFSS_SS_2024: SchoolPaper = {
  school: 'Montfort Secondary School',
  year: 2024,
  subject: 'Social Studies',
  topic: 'Exploring Citizenship and Governance — Declining Birth Rates',
  backgroundContext: `Birth rates have decreased worldwide. Factors contributing to this problem include economic uncertainties, changing views towards marriage and parenthood, delayed marriages, career aspirations and work-life balance. A reduced birth rate can cause serious problems in society such as an ageing population, which can severely strain social services such as the healthcare system. Declining birth rates also means there will be labour shortages which can harm businesses and the economy. With a shrinking tax-paying population, it also means the government will have difficulties collecting tax revenue to take care of the country. Governments around the world have been trying to encourage their citizens to give birth more. Measures include providing financial incentives to parents of young children, implementing family-friendly policies at workplaces that allow working parents to spend time with their children, encouraging fathers to play a more active role as care-givers and changing citizens' mindsets.`,
  sources: [
    { label: 'Source A', provenance: 'From an article on the Baby Bonus Scheme, published on Channel NewsAsia website, 2023.', content: 'Parents will receive a cash gift between $8000 to $12000 upon the birth of the child. If parents deposit money into their child\'s Child Development Account (CDA), the government will also match their deposits dollar-by-dollar, up to $18000. Some women were happy with the additional financial support. However, some mothers feel that the Baby Bonus is generous but useless. While they will be getting free cash, it is not what working mothers need the most. Many working mothers work 10-hour days but still have to cope with the demands of child-rearing once they reach home. The lack of workplace support in the form of flexible hours or the chance to work from home have turned them away from child-birth.' },
    { label: 'Source B', provenance: 'A cartoon on managing birth rates in Singapore, published in The Straits Times, July 2015.', content: '[Cartoon depicting various government measures to encourage birth rates — financial incentives, housing grants, etc. — with sceptical citizens responding]' },
    { label: 'Source C', provenance: 'From a report on how different countries attempted to raise birth rates, published on BBC website, May 2021.', content: 'Over nine years, the small Japanese town of Nagi-cho managed to double its birth rate from 1.4 to 2.8 children per woman with an extensive scheme of family friendly policies. Families get baby bonuses and children allowances. In Korea, researchers at the University of Seoul found that fertility rates increased when men helped out more at home. Sweden\'s fertility rates also increased in the 2000s. Mothers and fathers are offered generous leave after having a baby. Fathers take as much as 30% of the number of days of parental leave that mothers do.' },
    { label: 'Source D', provenance: 'Comments made by a Singaporean published on The Straits Times Forum, Dec 2020.', content: 'Some women would quit their jobs to take care of their children but others would not. When making decisions on whether to have children, it all boils down to attitude towards one\'s career and personal choice. Family-oriented women are more likely than career-oriented women to be encouraged by paid maternity leave and monetary incentives to have more children. For career-oriented women, one-time financial incentives will not entice them to make the leap into motherhood. Society\'s mindset about what makes for a fulfilling life has changed. There is no one-size fits all solution.' },
    { label: 'Source E', provenance: 'Speech by Mr Alex Yam, MP for Marsiling-Yew Tee GRC, April 2016.', content: 'Since 2001, we have committed billions of dollars into the Baby Bonus Scheme. If there\'s one thing we\'ve learnt, money isn\'t the motivating factor. In fact, I am uncomfortable even with the term Baby Bonus. The baby itself is the bonus, a bonus from a happy marriage that forms the basis for joy and hope in family life. The monetary bonuses help but can never be the motivation for having children. In the past, it was natural for young people to get married, buy a house, have children. Today, many young couples choose not to have children. They prioritise having time for themselves.' },
    { label: 'Source F', provenance: 'From a survey conducted by Institute of Policy Studies, Jan 2024.', content: '70% of young people aged 21 to 34 polled think it is not necessary to get married or have children in a marriage but they do foresee themselves getting married, and hope to have children eventually. They are held back by practical concerns such as wanting to first advance their careers and build a comfortable life, as well as the cost and stress of raising children. The top two reasons for not dating or getting married are that they have not met the right person yet, and that they prefer to remain single.' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. What is the attitude of women towards the Baby Bonus scheme? Explain your answer using details from the source.', marks: 5, lormsSummary: 'Inference question — identify women\'s mixed attitudes (happy about financial support but frustrated about lack of workplace flexibility)' },
    { part: 'b', question: 'Study Sources B and C. How similar are Sources B and C? Explain your answer.', marks: 7, lormsSummary: 'Comparison question — compare Singapore government measures vs international examples of family-friendly policies' },
    { part: 'c', question: 'Study Sources D and E. Does Source D surprise you about what Source E said about Singaporeans\' attitudes towards having children? Explain your answer.', marks: 7, lormsSummary: 'Surprise/Reliability question — evaluate if individual experience confirms or challenges MP\'s assessment' },
    { part: 'd', question: 'Study Source F. Does this source prove that it is impossible to improve birth rates? Explain your answer.', marks: 6, lormsSummary: 'Prove/Reliability question — evaluate survey data as evidence for/against possibility of improving birth rates' },
    { part: 'e', question: '\'Financial incentives are the best way to manage declining birth rates.\' Using sources in this case study, explain how far you would agree with this statement.', marks: 10, lormsSummary: 'Hybrid SEQ — weigh financial incentives against other factors (workplace policies, societal mindsets, gender roles) using all sources' },
  ],
  hasModelAnswers: false,
};

// ═══════════════════════════════════════════════════════════════
//  CCHM HISTORY 2025 — "Korean War: Who Was to Blame?"
// ═══════════════════════════════════════════════════════════════

export const CCHM_HISTORY_2025: SchoolPaper = {
  school: 'CHIJ St. Joseph\'s Convent (CCHM)',
  year: 2025,
  subject: 'History',
  topic: 'Korean War — Who Was to Blame for Escalating Tensions?',
  backgroundContext: `On 25 June 1950, three years of intense fighting began between North and South Korea. Soon, Korea became the centre of the watching world as North Korean forces supported by Chinese troops battled an international coalition of nations led by the United States, under the authority of the United Nations. Both sides attempted to win the war, but they would reach an eventual stalemate and armistice in 1953.`,
  sources: [
    { label: 'Source A', provenance: 'A leaflet dropped by the United States in North Korea, 3 April 1953.', content: '"So-called Soviet advisers are Russian special agents to control China. Stay safe and keep fit for fighting against the Communist Soviet puppets!"' },
    { label: 'Source B', provenance: 'Truman speaking at a press conference on 29 June 1950.', content: 'We are not at war. The Republic of Korea was set up with the United Nation\'s help. It is a recognised government by the members of the United Nations. It was unlawfully attacked by a bunch of bandits from North Korea. The United Nations Security Council held a meeting and passed a resolution on the situation and asked the members to go to the relief of the Korean Republic. The members of the United Nations are going to the relief of the Korean Republic to suppress a bandit raid on the Republic of Korea. That is all it is.' },
    { label: 'Source C', provenance: 'An extract taken from Truman\'s memoirs published in 1965.', content: 'In my generation, this was not the first time that the strong had attacked the weak. Communism was acting in Korea just as Hitler, Mussolini and the Japanese had acted fifteen, twenty years earlier. I felt certain that if South Korea was allowed to fall, Communist leaders would be emboldened to override nations close to our own shores. If the Communists were permitted to force their way into the Republic of Korea without opposition from the free world, no small nation would have the courage to resist threats and aggression by stronger Communist neighbours.' },
    { label: 'Source D', provenance: 'A report by the Ministry of Internal Affairs, DPRK (North Korea), transmitted by radio on 25 June 1950.', content: 'Early on the morning of 25 June 1950, troops of the so-called "army of national defence" of the puppet government of South Korea began a surprise attack on the territory of North Korea along the entire 38th parallel. Having begun a surprise attack, the enemy invaded the territory of North Korea to a depth of one or two kilometres north of the 38th parallel.' },
    { label: 'Source E', provenance: 'A leaflet by the United Nations, dropped in Korea. Depicts a Russian Officer riding on the back of Mao Zedong. Title: "Road to Failure".', content: '"Chinese Subservience — The Chinese Communists bend body and knees to Soviet Russia!"' },
    { label: 'Source F', provenance: 'Adapted from a Chinese historian on China\'s entry in the Korean War, 1990.', content: 'China\'s decision to intervene in the Korean War has its historical roots. It was the natural result of gradually developed animosity between the Chinese Communist Party (CCP) and the United States. The Chinese leaders had no intention at all of intervening in the war at its beginning, and they provided only moral support for Kim Il-Sung. On 27 June, Truman not only ordered direct American air and naval support for South Korea but also decided to reintervene in the Chinese civil war by positioning the 7th Navy Fleet between the Chinese mainland and Taiwan.' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. What is the message of Source A? Explain your answer, using details of the source and your knowledge.', marks: 5, lormsSummary: 'Message inference — US propaganda framing Soviets as controllers of China' },
    { part: 'b', question: 'Study Sources B and C. How far does Source C help you to decide if Truman was telling the truth in Source B? Explain your answer.', marks: 6, lormsSummary: 'Reliability comparison — compare public statement (press conference) vs private reflection (memoirs) for consistency' },
    { part: 'c', question: 'Study Source D. How surprised are you by Source D? Explain your answer.', marks: 5, lormsSummary: 'Surprise evaluation — North Korean account blaming South for starting the war' },
    { part: 'd', question: 'Study Sources E and F. To what extent would the cartoonist in Source E have agreed with the historian in Source F? Explain your answer.', marks: 6, lormsSummary: 'Agreement evaluation — propaganda cartoon vs academic historian analysis of Chinese motives' },
    { part: 'e', question: '\'The Communist Bloc escalated tensions in Korea to spread communism.\' How far do the sources support this view? Explain your answer.', marks: 8, lormsSummary: 'Hybrid SEQ — evaluate all sources for/against the hypothesis about communist responsibility' },
  ],
  hasModelAnswers: false,
};

// ═══════════════════════════════════════════════════════════════
//  ST. MARGARET'S HISTORY 2023 — "Stalin's Great Terror"
//  Complete paper + marking scheme
// ═══════════════════════════════════════════════════════════════

export const STMARGRETS_HISTORY_2023: SchoolPaper = {
  school: 'St. Margaret\'s School (Secondary)',
  year: 2023,
  subject: 'History',
  topic: 'Stalin\'s Great Terror',
  backgroundContext: `The period of Great Terror was initiated by Stalin in mid-1934 and lasted till 1938 to preserve control over the Soviet Union. This period consisted of three major features: the show trials of leading members of the Politburo and senior army officers, purges of a vast number of Communist Party members, and the arrest of ordinary citizens suspected to be 'enemies of the state'. These methods were successful in eliminating many of Stalin's opponents. It was estimated that at least 10 million people died during Stalin's Great Terror. Subsequent leaders after Stalin such as Khrushchev felt that the methods used in the Great Terror were too harsh and went on to criticise Stalin's rule during this period.`,
  sources: [
    { label: 'Source A', provenance: 'An account by a survivor of the Great Terror in 1970.', content: 'With regard to the Great Terror, we could never imagine it would end. It was essential to smile because if you did not, it meant that you were afraid or discontented. Everybody who worked for the State had to walk around wearing a cheerful expression, as though to say, "What\'s going on is no concern of mine. I have very important work to do, and I am terribly busy. My conscience is clear and if somebody has been arrested, there must be a good reason." The mask was taken off only at home. Some people had adapted to the terror so well that they knew how to profit from it.' },
    { label: 'Source B', provenance: 'An extract from a book \'Stalin\' written by Isaac Deutscher, a communist based in Poland in 1961.', content: 'Stalin offered his nation a positive and new programme of social organisation which, though caused suffering for many, also created undreamt-of openings for others. For nearly three years, his iron broom had furiously swept every office in the state. Not a single administrator who had held office in 1936 could be around by the end of 1938. The purges created numberless vacancies in every field. From 1933 to 1938 about half a million administrators, technicians, economists, and men of other professions graduated, and filled the ranks of the purged and emptied offices. These men, brought up in the Stalinist cult from childhood, threw themselves into their work with a zeal and enthusiasm undimmed by recent events.' },
    { label: 'Source C', provenance: 'Extract from a history reference book by a British author, 1997.', content: 'Between the years 1934 to 1938, hundreds of important officials were arrested, tortured, made to confess to all sorts of crime such as plotting with Trotsky or with capitalist government to topple the Soviet state. They were also forced to appear in a series of \'show trials\' at which they were certainly found guilty and sentenced to death or labour camp. The purges were successful in eliminating possible alternative leaders and terrorising the masses into obedience, but the consequences were serious: many of the best brains in the government, in the army and in industry had disappeared.' },
    { label: 'Source D', provenance: 'From the autobiography of L. Kopelev, a member of the Communist Party published in 1981 after Stalin\'s death.', content: 'I regarded the purge trials of 1937 and 1938 as an expression of some far-sighted policy. I believed that Stalin was right in deciding on these terrible measures to discredit all forms of political opposition, once and for all. We, the communists had to be united, knowing neither indecisiveness nor doubt. Therefore, the opposition leaders had to be depicted as villains, so that the people would come to hate them. Finding myself in prison, I did not lose my conviction as in prison, I became even more consistent a Stalinist.' },
    { label: 'Source E', provenance: 'From a speech by Khrushchev in a Politburo meeting with key communist members in 1956.', content: 'It became apparent that many Party members who were branded during the period of the Great Terror as \'enemies\' were actually never enemies or spies but were always honest Communists. Stalin was a distrustful man, sickly suspicious. This suspicion created in him a general distrust, even toward eminent Party workers whom he had known for years. Everywhere and in everything he saw \'enemies\' and \'spies\'. Possessing unlimited power, he indulged in great willfulness and choked a person morally and physically.' },
    { label: 'Source F', provenance: 'A Soviet photograph of factory workers voting for the arrest of the \'enemy of the state\' in 1937.', content: '[Photograph showing factory workers raising their hands to vote for the arrest of a colleague labelled as an "enemy of the state"]' },
  ],
  sbcsQuestions: [
    { part: 'a', question: 'Study Source A. What can you learn from this source about the lives of the Soviets under the Great Terror? Explain your answer.', marks: 5, lormsSummary: 'L1: Description/lift [1] → L2: Sub-message without links to Great Terror [2-3] → L3: Valid inference linked to Stalin\'s Great Terror (pretentious lives, fear) [4-5]' },
    { part: 'b', question: 'Study Sources B and C. How similar are these sources as evidence about Stalin\'s Soviet Union? Explain your answer.', marks: 5, lormsSummary: 'L1: Describes either source [1] → L2: Similarity OR difference based on content [2-3] → L3: Similarity AND difference [4-5]' },
    { part: 'c', question: 'Study Sources D and E. Does what Source E says make you surprised about what was said in Source D? Explain your answer.', marks: 6, lormsSummary: 'L1: Uncritical acceptance [1] → L2: Surprised/Not surprised based on content disagreement [2-3] → L3: Surprised/Not surprised based on CK or other sources [4-5] → L4: Purpose analysis [6]' },
    { part: 'd', question: 'Study Source F. How useful is this source as evidence about the Great Terror? Explain your answer.', marks: 6, lormsSummary: 'Utility evaluation — photograph as evidence of public participation in purges' },
    { part: 'e', question: '\'The Great Terror was necessary for Stalin to control the Soviet Union.\' How far do these sources support this statement? Explain your answer.', marks: 8, lormsSummary: 'Hybrid SEQ — weigh evidence from all sources on necessity vs excess of Great Terror' },
  ],
  hasModelAnswers: true,
};

// ═══════════════════════════════════════════════════════════════
//  EXPORT ALL PAPERS AS A COLLECTION
// ═══════════════════════════════════════════════════════════════

export const ALL_SCHOOL_PAPERS: SchoolPaper[] = [
  VICTORIA_SS_2020,
  MFSS_SS_2024,
  DEYI_HISTORY_2024,
  EDGEFIELD_HISTORY_2024,
  CCHM_HISTORY_2025,
  STMARGRETS_HISTORY_2023,
];

export const ALL_MODEL_ANSWERS: SchoolModelAnswer[] = [
  VICTORIA_SS_2020_ANSWERS,
];

/**
 * Get formatted few-shot examples for AI prompts
 */
export function getRealSchoolExamples(subject: 'Social Studies' | 'History'): string {
  const papers = ALL_SCHOOL_PAPERS.filter(p => p.subject === subject);
  
  let output = '';
  for (const paper of papers) {
    output += `\n\n=== ${paper.school} ${paper.year} (${paper.subject}) ===\n`;
    output += `Topic: ${paper.topic}\n\n`;
    output += `Background: ${paper.backgroundContext}\n\n`;
    
    output += `Sources:\n`;
    for (const source of paper.sources) {
      output += `${source.label}: [${source.provenance}]\n${source.content.substring(0, 200)}...\n\n`;
    }
    
    output += `Questions:\n`;
    for (const q of paper.sbcsQuestions) {
      output += `Part (${q.part}) [${q.marks}m]: ${q.question}\n`;
    }
  }
  
  return output;
}

/**
 * Get model answer examples formatted for grading prompts
 */
export function getModelAnswerExamples(subject: 'Social Studies' | 'History'): string {
  return `REAL MOE SCHOOL MODEL ANSWER EXAMPLE — Victoria School SS 2020

Question 1a: Study Source A. What is the message of this cartoon? Explain your answer. [6]

L4 Message (4-5m):
The message is that recycling is seen as negative / undesirable act by many adult Singaporeans. (Behaviour of Singaporeans toward recycling)
This is because many feel that it is not their responsibility and it should be the responsibility of those who earn/are paid to do these jobs such as the Karang Guni men. (reasons for their behaviour — mainly relating to responsibility)

L5 Message with broader outcome (6m):
The message of this cartoon is to create a sense of shared responsibility among Singaporeans toward recycling (source was created in 2010). In the past since recycling was perceived to be undesirable act, it was necessary for actions to be taken to have a change of mindset among Singaporeans and work together for the good of society — protecting the environment.

Question 1b: Does the resident in Source C think that the project in Source B will work? [7]

L4 Will work AND Will NOT work based on content (6m):
Will work — as the new bin educates residents of how to recycle. Source B — "we aim to increase public awareness about the process of recycling right and reduce contamination"... "Notices are also to be placed at a person's eye-level...visualise what is allowed to be recycled with minimal effort". Source C — "...many are still not very educated about how to recycle properly..."

Will not work — convenience. Source B — "We hope to create a transparent bin which may make people more conscious of what they are placing into the bin..." Source C — "Do you really think that Singaporeans in general will take the time out to do that when they don't even take the time to do simple things?" Will not work as most Singaporeans may still throw things that do not belong to the recycling bin even if the bin is transparent as the process of recycling right is too tedious and time consuming.

L5 Will not work based on Perspective (7m):
The resident would not think that the project will work as she feels cynical/negative that Singaporeans will change their mindset and put in the time to recycle properly. Source B's project may not address the root cause which is Singaporean's behaviour as it is only dealing with the bin's structure.`;
}
