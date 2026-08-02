import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

function SkillTracking() {

    return (

        <AppShell>

            <h1>Skill Tracking</h1>

            <br />

            <Panel title="Current Progress">

                <p>Confidence —  Improving</p>

                <progress value="80" max="100"></progress>

                <br /><br />

                <p>Communication — Active</p>

                <progress value="70" max="100"></progress>

                <br /><br />

                <p>Logical Thinking — Strong</p>

                <progress value="90" max="100"></progress>

            </Panel>

        </AppShell>

    );

}

export default SkillTracking;