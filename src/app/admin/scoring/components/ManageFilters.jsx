'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input
} from '@/components/MaterialTailwind';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

export default function ManageFilters({
  activeFilters,
  setActiveFilters,
  className = ''
}) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  return (
    <div className={className}>
      <div
        className="flex cursor-pointer mb-2"
        onClick={() => setManageDialogOpen(true)}>
        <IconAdjustmentsHorizontal size={24} />
        <span className="ml-1">Manage Filters</span>
      </div>
      <Dialog
        open={manageDialogOpen}
        handler={() => setManageDialogOpen(!manageDialogOpen)}>
        <DialogHeader>Manage Filters</DialogHeader>
        <DialogBody>
          <div className="mb-5">
            <Input
              type="number"
              label="Minimum Favorites Required"
              value={activeFilters.minFavorites}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  minFavorites: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Input
              type="number"
              label="Minimum HMs Required"
              value={activeFilters.minHMs}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  minHMs: Number(e.target.value)
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="mr-1"
            color="blue"
            onClick={() => setManageDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
