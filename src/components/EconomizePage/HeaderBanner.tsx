import { Header, HeaderLabel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';

const HeaderBanner = () => {
  const api = useApi(economizeApiRef);
  const [orgName, setOrgName] = useState('');

  const fetchOrgName = async () => {
    const orgname = await api.getOrgAndProject();
    setOrgName(orgname);
  };

  useEffect(() => {
    fetchOrgName();
  }, []);
  return (
    <Header
      title="Economize Cloud"
      subtitle="Your cloud infrastructure costs, demystified"
    >
      {orgName && <HeaderLabel value={orgName} label="Organization" />}
    </Header>
  );
};

export default HeaderBanner;
