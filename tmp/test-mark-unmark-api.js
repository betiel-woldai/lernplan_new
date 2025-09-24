const sessionId = 'd7cc7ff1-1700-4b3a-9bdd-1897034f8e0a';
const baseUrl = 'http://localhost:3000';

async function testMarkUnmarkMechanism() {
  try {
    console.log('🧪 TESTING: Core Mark/Unmark XP Mechanism via API');

    // 1. Get current XP
    console.log('\n📊 Step 1: Getting current XP...');
    const userResponse = await fetch(`${baseUrl}/api/users/62d1b19b-3874-43b1-9424-ca7c2de10557`);
    const userData = await userResponse.json();
    const initialXP = userData.currentXP;
    console.log(`Initial XP: ${initialXP}`);

    // 2. Mark session as completed
    console.log('\n✅ Step 2: Marking session as completed...');
    const markCompleteResponse = await fetch(`${baseUrl}/api/calendar/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed: true
      })
    });

    if (!markCompleteResponse.ok) {
      throw new Error(`Failed to mark complete: ${markCompleteResponse.status} ${await markCompleteResponse.text()}`);
    }

    console.log('✅ Session marked as completed');

    // 3. Check XP after marking complete
    console.log('\n📊 Step 3: Checking XP after completion...');
    const afterCompleteResponse = await fetch(`${baseUrl}/api/users/62d1b19b-3874-43b1-9424-ca7c2de10557`);
    const afterCompleteData = await afterCompleteResponse.json();
    const afterCompleteXP = afterCompleteData.currentXP;
    console.log(`XP after completion: ${afterCompleteXP}`);

    const xpIncrease = afterCompleteXP - initialXP;
    if (xpIncrease > 0) {
      console.log(`✅ XP INCREASED by ${xpIncrease}! Marking works!`);
    } else {
      console.log(`❌ XP DID NOT INCREASE! Expected increase, got: ${xpIncrease}`);
    }

    // 4. Unmark session (mark as incomplete)
    console.log('\n❌ Step 4: Unmarking session (mark as incomplete)...');
    const markIncompleteResponse = await fetch(`${baseUrl}/api/calendar/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed: false
      })
    });

    if (!markIncompleteResponse.ok) {
      throw new Error(`Failed to mark incomplete: ${markIncompleteResponse.status} ${await markIncompleteResponse.text()}`);
    }

    console.log('❌ Session marked as incomplete');

    // 5. Check XP after unmarking
    console.log('\n📊 Step 5: Checking XP after unmarking...');
    const afterUnmarkResponse = await fetch(`${baseUrl}/api/users/62d1b19b-3874-43b1-9424-ca7c2de10557`);
    const afterUnmarkData = await afterUnmarkResponse.json();
    const finalXP = afterUnmarkData.currentXP;
    console.log(`Final XP: ${finalXP}`);

    const xpDecrease = afterCompleteXP - finalXP;
    if (finalXP === initialXP) {
      console.log(`✅ XP DECREASED by ${xpDecrease}! XP returned to initial value! Unmarking works!`);
    } else if (xpDecrease > 0) {
      console.log(`⚠️ XP DECREASED by ${xpDecrease}, but not to initial value. Expected: ${initialXP}, Got: ${finalXP}`);
    } else {
      console.log(`❌ XP DID NOT DECREASE! Expected decrease of ${xpIncrease}, got change of ${initialXP - finalXP}`);
    }

    // Summary
    console.log('\n🎯 SUMMARY:');
    console.log(`Initial XP: ${initialXP}`);
    console.log(`After Mark Complete: ${afterCompleteXP} (${afterCompleteXP >= initialXP ? '+' : ''}${afterCompleteXP - initialXP})`);
    console.log(`After Unmark: ${finalXP} (${finalXP >= afterCompleteXP ? '+' : ''}${finalXP - afterCompleteXP})`);

    if (xpIncrease > 0 && finalXP === initialXP) {
      console.log('✅ SUCCESS: Both marking and unmarking work correctly!');
    } else if (xpIncrease > 0) {
      console.log('⚠️ PARTIAL: Marking works, but unmarking has issues');
    } else {
      console.log('❌ FAILURE: Core XP mechanism is broken');
    }

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testMarkUnmarkMechanism();