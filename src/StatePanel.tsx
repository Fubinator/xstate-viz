import React from 'react';
import ReactJson from 'react-json-view';
import { useSelector } from '@xstate/react';
import { StateFrom } from 'xstate';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useSimulation } from './SimulationContext';
import { createSimulationMachine } from './simulationMachine';

const JSONView: React.FC<{ src: object; name: string }> = ({ src, name }) => (
  <ReactJson
    src={src}
    name={name}
    theme="monokai"
    collapsed={1}
    onEdit={false}
    displayDataTypes={false}
    displayObjectSize={false}
  />
);

const selectState = (
  state: StateFrom<ReturnType<typeof createSimulationMachine>>,
) =>
  state.context.service
    ? state.context.services[state.context.service]?.getSnapshot()
    : undefined; // TODO: select() method on model

const ActorState: React.FC<{ state: any }> = ({ state }) => {
  const value = state?.value;
  const context = state?.context;
  return (
    <>
      <JSONView
        src={typeof value === 'string' ? { _: value } : value}
        name="Value"
      />
      <JSONView src={context} name="Context" />
      <JSONView src={state} name="State" />
    </>
  );
};

const StateAccordion: React.FC<{ state: any; title: string }> = ({
  state,
  title,
}) => {
  return (
    <Accordion allowMultiple={true} allowToggle={true}>
      <AccordionItem>
        <AccordionButton>
          <AccordionIcon />
          {title}
        </AccordionButton>
        <AccordionPanel>
          <ActorState state={state} />
          {state &&
            'children' in state &&
            Object.keys(state.children).map((key) => {
              const child = state.children[key];
              return (
                <StateAccordion
                  key={key}
                  state={(child as any).getSnapshot()}
                  title={child.id}
                />
              );
            })}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export const StatePanel: React.FC = () => {
  const state = useSelector(useSimulation(), selectState);

  return <ActorState state={state} />;
};
