import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsConditions() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="sign-page" style={{ maxWidth: '800px' }}>
      <div className="sign-card">
        <button className="btn-back" onClick={() => navigate(-1)}>&#8592; Back</button>
        <div className="sign-header">
          <h1>Terms &amp; Conditions</h1>
          <p>AgreeKaro Platform - Standard Agreement Terms</p>
        </div>

        <div className="tc-content">
          <div className="tc-intro">
            <p>This Agreement has been electronically generated through the AgreeKaro&trade; platform. AgreeKaro acts solely as an independent technology platform for the creation, management, electronic acceptance, verification, secure storage, and audit trail of digital agreements.</p>
          </div>

          <section className="tc-section">
            <h3>4. Scope of Work</h3>
            <p>Party A shall perform only the services expressly described in this Agreement. Any additional work requested after acceptance shall require mutual agreement and may affect pricing or timelines.</p>
          </section>

          <section className="tc-section">
            <h3>5. Responsibilities</h3>
            <p>Party A shall perform services professionally and maintain confidentiality. Party B shall provide timely information, approvals and payments. Delays caused by either Party may reasonably extend timelines.</p>
          </section>

          <section className="tc-section">
            <h3>6. Revisions</h3>
            <p>Revision requests beyond the agreed number may require additional charges and revised delivery dates.</p>
          </section>

          <section className="tc-section">
            <h3>7. Intellectual Property</h3>
            <p>Unless otherwise agreed, ownership of final deliverables transfers only after full payment. Until then all intellectual property remains with Party A.</p>
          </section>

          <section className="tc-section">
            <h3>8. Confidentiality</h3>
            <p>Both Parties shall keep confidential all non-public information exchanged during the relationship except where disclosure is required by law.</p>
          </section>

          <section className="tc-section">
            <h3>9. Changes</h3>
            <p>No amendment is valid unless accepted by both Parties through the AgreeKaro platform as a new version.</p>
          </section>

          <section className="tc-section">
            <h3>10. Termination</h3>
            <p>Either Party may terminate where legally permitted. Completed work remains payable. Rights accrued before termination survive.</p>
          </section>

          <section className="tc-section">
            <h3>11. Force Majeure</h3>
            <p>Neither Party is liable for delays caused by events beyond reasonable control including disasters, government restrictions and similar events.</p>
          </section>

          <section className="tc-section">
            <h3>12. Compliance with Applicable Laws</h3>
            <p>Each Party agrees to comply with all applicable laws, regulations and legally enforceable obligations relevant to this Agreement based on the Parties, place of performance or competent jurisdiction. If any clause is unenforceable, the remaining clauses remain effective.</p>
          </section>

          <section className="tc-section">
            <h3>13. Platform Role</h3>
            <p>AgreeKaro is an independent technology platform that facilitates the creation, management, electronic acceptance, secure storage, and verification of digital agreements between Party A and Party B.</p>
            <p>AgreeKaro charges a Platform Service Fee solely for providing agreement generation, digital acceptance, document management, audit trail, verification, and other platform-related services. This fee is independent of, and shall not be considered part of, the commercial value, project cost, service charges, or any financial consideration agreed upon between the Parties under this Agreement.</p>
            <p>AgreeKaro is not a contracting party to this Agreement and does not represent, employ, supervise, endorse, guarantee, or control either Party. AgreeKaro does not provide legal advice, legal representation, financial services, payment processing, escrow services, employment services, arbitration, mediation, or dispute resolution services unless expressly stated otherwise.</p>
            <p>All payments, advances, milestone payments, balances, refunds, reimbursements, taxes, invoices, and any other financial obligations arising from this Agreement shall be negotiated, processed, and settled directly between Party A and Party B through payment methods chosen by them independently. AgreeKaro does not collect, receive, hold, transfer, process, guarantee, or safeguard any payments made under this Agreement.</p>
          </section>

          <section className="tc-section">
            <h3>14. No Agency Relationship</h3>
            <p>Nothing contained in this Agreement, nor the use of the AgreeKaro platform, shall be interpreted or construed as creating any partnership, joint venture, agency, fiduciary, employment, franchise, brokerage, representative, or similar legal relationship between AgreeKaro and either Party, or between the Parties themselves unless expressly stated in writing.</p>
            <p>AgreeKaro acts solely as an independent technology platform and shall not be considered an agent, representative, broker, intermediary, employer, employee, consultant, guarantor, trustee, legal representative, or authorized signatory of either Party.</p>
            <p>Each Party enters into this Agreement voluntarily, independently, and on its own behalf and shall remain solely responsible for its own actions, representations, obligations, liabilities, and compliance with all applicable laws.</p>
            <p>Neither Party shall have any authority to bind AgreeKaro or the other Party to any obligation, representation, warranty, commitment, or liability except as expressly provided in this Agreement.</p>
          </section>

          <section className="tc-section">
            <h3>15. No Guarantee of Performance</h3>
            <p>AgreeKaro provides only the technological infrastructure for generating, managing, electronically accepting, storing, and verifying digital agreements.</p>
            <p>AgreeKaro does not verify or guarantee the identity, legal capacity, authority, qualifications, financial capability, business legitimacy, credibility, reputation, performance, quality of work, delivery of services, completion of projects, payment obligations, or contractual compliance of either Party.</p>
            <p>The Parties acknowledge that they are solely responsible for conducting their own due diligence before entering into this Agreement.</p>
          </section>

          <section className="tc-section">
            <h3>16. Electronic Records &amp; Digital Evidence</h3>
            <p>The Parties acknowledge that AgreeKaro maintains electronic records relating to the creation, transmission, review, acceptance, and integrity of this Agreement. Such records may include, without limitation:</p>
            <ul className="tc-list">
              <li>Agreement metadata and version history</li>
              <li>Agreement creation records</li>
              <li>Electronic acceptance records</li>
              <li>Email-based OTP verification records</li>
              <li>Timestamp, IP address, browser, device, and OS information</li>
              <li>SHA-256 Document Hash and Document Integrity Certificate</li>
              <li>Digital Audit Trail</li>
            </ul>
            <p>To the extent permitted under applicable law, the Parties acknowledge that these electronic records are intended to provide reliable evidence regarding the creation, transmission, review, acceptance, authenticity, and integrity of this Agreement.</p>
          </section>

          <section className="tc-section">
            <h3>17. Severability</h3>
            <p>If any provision of this Agreement is determined by a court or other competent authority to be invalid, illegal, unenforceable, or incapable of being enforced, such provision shall be modified only to the extent necessary to make it enforceable. If such modification is not legally possible, the affected provision shall be deemed severed from this Agreement. The remaining provisions shall continue in full force and effect.</p>
          </section>

          <section className="tc-section">
            <h3>18. Waiver</h3>
            <p>No failure, delay, omission, or partial exercise by either Party in exercising any right, remedy, power, or privilege under this Agreement shall constitute or operate as a waiver of such right, remedy, power, or privilege. Any waiver shall be valid only if expressly made in writing by the Party granting such waiver and shall apply solely to the specific matter for which it was given.</p>
          </section>

          <section className="tc-section">
            <h3>19. Survival</h3>
            <p>The rights and obligations of the Parties which, by their nature or express wording, are intended to survive the completion, expiration, cancellation, or termination of this Agreement shall continue in full force and effect. Such provisions include, without limitation: Payment obligations, Confidentiality, Intellectual Property Rights, Limitation of Liability, Compliance with Applicable Laws, Electronic Records, Digital Verification, Audit Trail, Platform Role, and No Agency Relationship.</p>
          </section>

          <section className="tc-section">
            <h3>20. Limitation of Liability</h3>
            <p>Except where liability cannot legally be excluded or limited under applicable law, neither Party shall be liable to the other Party for any indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or in connection with this Agreement.</p>
            <p>Each Party shall remain responsible for its own actions, omissions, representations, contractual obligations, payments, and compliance with applicable laws. Nothing in this Agreement shall exclude or limit liability for fraud, fraudulent misrepresentation, willful misconduct, or any liability that cannot legally be excluded or limited under applicable law.</p>
          </section>

          <section className="tc-section">
            <h3>21. Entire Agreement</h3>
            <p>This Agreement constitutes the complete and final understanding between the Parties concerning the subject matter covered by this Agreement and supersedes all prior discussions, negotiations, proposals, quotations, communications, emails, messages, representations, understandings, or agreements relating to the same subject matter.</p>
            <p>Any amendment, modification, addition, deletion, or variation to this Agreement shall be valid only if mutually accepted by both Parties and incorporated into a new or revised version of the Agreement through the AgreeKaro platform or otherwise documented and accepted in writing.</p>
          </section>

          <section className="tc-section">
            <h3>22. Digital Acceptance</h3>
            <p>The Parties acknowledge and agree that this Agreement may be executed electronically through the AgreeKaro platform and that electronic acceptance shall constitute the Parties' acceptance of the Agreement to the fullest extent permitted by applicable law.</p>
            <p>The electronic acceptance process may include email-based OTP verification, secure acceptance links, timestamps, IP address records, browser information, device information, operating system information, timezone information, agreement version records, audit trail records, and document hash values.</p>
            <p>By completing the electronic acceptance process, each Party confirms that:</p>
            <ul className="tc-list">
              <li>They have read and understood the Agreement;</li>
              <li>They voluntarily accept its terms;</li>
              <li>They have the legal capacity and authority to enter into the Agreement;</li>
              <li>The information provided by them is accurate to the best of their knowledge; and</li>
              <li>Their electronic acceptance is intended to create a binding agreement between the Parties, subject to applicable law.</li>
            </ul>
          </section>

          <section className="tc-section">
            <h3>23. Notices</h3>
            <p>Unless otherwise expressly agreed in writing, all notices, communications, requests, approvals, demands, consents, or other formal communications relating to this Agreement shall be made through the AgreeKaro platform or sent to the email address provided by the relevant Party during the creation or acceptance of this Agreement.</p>
            <p>Each Party shall be responsible for ensuring that its registered email address and other contact information remain accurate and up to date throughout the duration of the Agreement.</p>
          </section>

          <div className="tc-footer">
            <p>&copy; {year} AgreeKaro. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;
