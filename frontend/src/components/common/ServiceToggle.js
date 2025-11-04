import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';

const ServiceToggle = ({ service, checked, onToggle }) => {
  return (
    <Switch.Group as="div" className="flex items-center justify-between">
      <Switch.Label className="flex-1 text-sm text-gray-700">
        {service}
      </Switch.Label>
      <Switch
        checked={checked}
        onChange={() => onToggle(service, !checked)}
        className={`${
          checked ? 'bg-teal-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </Switch.Group>
  );
};

ServiceToggle.propTypes = {
  service: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default ServiceToggle;