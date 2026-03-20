import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import StorageEvent from './storage-event';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import type { HttpSnapshotItem } from 'shared';

@Entity()
export default class SyncSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  storageId: string;

  @Column({
    type: 'jsonb',
    transformer: {
      from: (value) => (value ? camelcaseKeys(value, { deep: true }) : value),
      to: (value) => (value ? decamelizeKeys(value, { deep: true }) : value),
    },
  })
  snapshot: Array<HttpSnapshotItem>;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StorageEvent, (storageEvent) => storageEvent.syncSession)
  storageEvents: StorageEvent[];
}
