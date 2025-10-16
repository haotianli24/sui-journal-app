import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, TextField } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";
export function CreateJournal({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const journalPackageId = useNetworkVariable("journalPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [title, setTitle] = useState("");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function create() {
    if (!currentAccount) return;

    const tx = new Transaction();

    /**
     * Task 2: 
     * 
     * Execute a call to the `journal::new_journal` function to create a new journal. 
     * 
     * Make sure to use the title input from the user
     */
    tx.moveCall({
      arguments: [tx.pure.string(title)],
      target: `${journalPackageId}::journal::new_journal`,
    });
    
    /**
     * Task 3: 
     * 
     * Transfer the new Journal object to the connected user's address
     * 
     */


    signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async ({ digest }) => {
            console.log("Transaction successful, digest:", digest);
            const { effects } = await suiClient.waitForTransaction({
              digest: digest,
              options: {
                showEffects: true,
              },
            });
    
            console.log("Transaction effects:", effects);
            console.log("Created objects:", effects?.created);
            
            const createdObject = effects?.created?.[0]?.reference?.objectId;
            if (createdObject) {
              onCreated(createdObject);
            } else {
              console.error("No created object found");
            }
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            console.error("Error details:", JSON.stringify(error, null, 2)); // More details
          },
        },
    );
  }

  return (
    <Container>
      <TextField.Root
        placeholder="Enter journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="3"
        mb="3"
      />
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={isSuccess || isPending || !title.trim()}
      >
        {isSuccess || isPending ? <ClipLoader size={20} /> : "Create Journal"}
      </Button>
    </Container>
  );
}