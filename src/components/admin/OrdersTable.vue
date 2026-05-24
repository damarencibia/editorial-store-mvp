<template>
  <DataTable
    :columns="columns"
    :rows="rows"
    emptyText="No hay órdenes registradas."
  >
    <template #cell-status="{ row }">
      <OrderStatusCell
        :orderId="row.id"
        :currentStatus="row.rawStatus"
        @changed="onStatusChanged(row, $event)"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from './DataTable.vue'
import OrderStatusCell from './OrderStatusCell.vue'

const props = defineProps<{
  orders: any[]
}>()

const columns = [
  { key: 'id', label: '#' },
  { key: 'customer_email', label: 'Cliente' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const rows = computed(() =>
  props.orders.map((o) => ({
    id: o.id,
    customer_email: o.customer_email,
    total: '$' + (o.total / 100).toFixed(2),
    status: o.status,
    rawStatus: o.status,
    created_at: new Date(o.created_at).toLocaleDateString('es-ES'),
  }))
)

function onStatusChanged(row: any, newStatus: string) {
  row.rawStatus = newStatus
}
</script>
