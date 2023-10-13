import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button
        onClick={handleOpen}
        sx={{
          color: "white",
          fontSize: "1.5rem",
        }}
      >
        Instructions
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <h3 id="onboarding-guide-creating-tests-for-solana-smart-contracts">
              Onboarding Guide: Creating Tests for Solana Smart Contracts
            </h3>{" "}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <ol>
              <li>
                <strong>Welcome to SOLBricks!</strong>
                <ul>
                  <li>
                    SOLBricks provides a visual interface similar to Scratch,
                    enabling you to create tests for Solana smart contracts
                    without writing a single line of code!
                  </li>
                </ul>
              </li>
              <li>
                <strong>Select Your Network:</strong>
                <ul>
                  <li>
                    On the top right, click on &quot;Select network&quot; and
                    choose the appropriate Solana network (e.g., devnet).
                  </li>
                </ul>
              </li>
              <li>
                <strong>Understand the Interface:</strong>
                <ul>
                  <li>
                    <strong>Logic Blocks:</strong> Found on the left side, these
                    blocks provide the foundation for your test logic.
                  </li>
                  <li>
                    <strong>Accounts &amp; KeyPairs:</strong> On the right,
                    manage your Solana accounts and key pairs. This is where
                    you&#39;ll assign roles for transactions.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Creating a Test:</strong>
                <ul>
                  <li>Click on the &quot;Test&quot; block to start.</li>
                  <li>Drag and drop it to the main workspace area.</li>
                </ul>
              </li>
              <li>
                <strong>Define Contract Interactions:</strong>
                <ul>
                  <li>
                    Click on the desired function (e.g., &quot;initGame&quot;).
                  </li>
                  <li>Assign arguments if necessary.</li>
                  <li>
                    Assign accounts and signers. For instance, for the
                    &quot;initGame&quot; function, you can assign the{" "}
                    <code>challenger</code> as &quot;Signer Alice&quot; and the{" "}
                    <code>opponent</code> as &quot;Signer Bob&quot;.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Assertions:</strong>
                <ul>
                  <li>
                    Use the &quot;Assert&quot; block to verify the expected
                    outcomes of your contract interactions. For instance, after
                    calling &quot;initGame&quot;, you might want to ensure that
                    the game&#39;s state has been initialized correctly.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Run the Test:</strong>
                <ul>
                  <li>
                    Once you&#39;ve set up all interactions and assertions,
                    click the &quot;RUN&quot; button at the top right. The
                    results will be displayed on the screen.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Troubleshooting:</strong>
                <ul>
                  <li>
                    If there&#39;s an error or unexpected outcome, review your
                    logic and accounts setup. Adjust as necessary and run the
                    test again.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Advanced Testing:</strong>
                <ul>
                  <li>
                    As you become more familiar with SOLBricks, you can dive
                    deeper by creating complex test scenarios, simulating
                    multi-step interactions, and more.
                  </li>
                </ul>
              </li>
            </ol>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
