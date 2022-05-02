import { Paper, MenuList, MenuItem, ListItemText } from '@material-ui/core';
import React from 'react';

import { useScroll } from '../../hooks/useScroll';

const menuData = [
  {
    name: 'Overview',
    link: 'overview',
  },
  {
    name: 'Daily Cost',
    link: 'daily-cost',
  },
  {
    name: 'Weekly Cost',
    link: 'weekly-cost',
  },
  {
    name: 'Monthly Cost',
    link: 'monthly-cost',
  },
  {
    name: 'Top Components',
    link: 'top-components',
  },
  {
    name: 'Anomalies',
    link: 'anomalies',
  },
  {
    name: 'Documentation',
    link: 'documentation',
  },
];

const Menu = () => {
  const [, setScroll] = useScroll();
  return (
    <Paper
      style={{
        backgroundColor: 'white',
        color: 'black',
        width: 320,
        maxWidth: '100%',
      }}
    >
      <MenuList>
        {menuData.map(item => (
          <MenuItem
            key={item.link}
            data-testid={`menu-item-${item.link}`}
            onClick={() => setScroll(item.link)}
          >
            <ListItemText>{item.name}</ListItemText>
          </MenuItem>
        ))}
      </MenuList>
    </Paper>
  );
};

export default Menu;
